const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// 🚀 NEON DATABASE CONNECTION
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { 
    rejectUnauthorized: false 
  }
});

// 🚀 CORS CONFIGURATION
app.use(cors({
  origin: [process.env.FRONTEND_URL, 'http://localhost:3000', 'https://enchanting-sfogliatella-455d3e.netlify.app'].filter(Boolean),
  credentials: true
}));

app.use(express.json());

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const userResult = await pool.query(
      'SELECT id, name, email, role, address FROM users WHERE id = $1',
      [decoded.id]
    );
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = userResult.rows[0];
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Check role middleware
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    next();
  };
};

// Validation functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  return password.length >= 8 && 
         password.length <= 16 && 
         /[A-Z]/.test(password) && 
         /[!@#$%^&*]/.test(password);
};

// Routes
app.get('/api/debug/stores', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM stores');
    res.json({ 
      success: true, 
      storeCount: result.rows.length,
      stores: result.rows
    });
  } catch (error) {
    res.json({ 
      success: false, 
      error: error.message
    });
  }
});

app.get('/api/debug/ratings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ratings');
    res.json({ 
      success: true, 
      ratingCount: result.rows.length,
      ratings: result.rows
    });
  } catch (error) {
    res.json({ 
      success: false, 
      error: error.message
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running', status: 'OK' });
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Store Ratings Backend API', 
    status: 'running',
    database: 'Neon PostgreSQL',
    endpoints: {
      health: '/api/health',
      login: '/api/login',
      register: '/api/register',
      admin: '/api/admin/*',
      user: '/api/user/*',
      store_owner: '/api/store-owner/*'
    }
  });
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const user = userResult.rows[0];
    const validPassword = (password === user.password);
    
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, address } = req.body;

    if (!name || !email || !password || !address) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (name.length < 20 || name.length > 60) {
      return res.status(400).json({ error: 'Name must be between 20 and 60 characters' });
    }

    if (address.length > 400) {
      return res.status(400).json({ error: 'Address must be less than 400 characters' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({ 
        error: 'Password must be 8-16 characters with uppercase and special character' 
      });
    }

    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const plainTextPassword = password;

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, address, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, address, role',
      [name, email, plainTextPassword, address, 'user']
    );

    const user = newUser.rows[0];

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Registration successful',
      token,
      user
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Change password
app.post('/api/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Both passwords are required' });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({ 
        error: 'New password must be 8-16 characters with uppercase and special character' 
      });
    }

    const userResult = await pool.query(
      'SELECT password FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = userResult.rows[0];
    const validCurrentPassword = (currentPassword === user.password);
    
    if (!validCurrentPassword) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const plainNewPassword = newPassword;

    await pool.query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [plainNewPassword, req.user.id]
    );

    res.json({ message: 'Password updated successfully' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get stores for user
app.get('/api/user/stores', auth, async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT s.*, 
        COALESCE(AVG(r.rating), 0) as average_rating,
        (
          SELECT rating FROM ratings 
          WHERE store_id = s.id AND user_id = $1
          LIMIT 1
        ) as user_rating
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
    `;

    const params = [req.user.id];

    if (search) {
      query += ` WHERE s.name ILIKE $2 OR s.address ILIKE $2`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY s.id ORDER BY s.name`;

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Get stores error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Rate a store
app.post('/api/user/stores/:storeId/rate', auth, async (req, res) => {
  try {
    const { storeId } = req.params;
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    const storeResult = await pool.query('SELECT id FROM stores WHERE id = $1', [storeId]);
    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Store not found' });
    }

    const existingRating = await pool.query(
      'SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2',
      [req.user.id, storeId]
    );

    if (existingRating.rows.length > 0) {
      await pool.query(
        'UPDATE ratings SET rating = $1 WHERE user_id = $2 AND store_id = $3',
        [rating, req.user.id, storeId]
      );
      res.json({ message: 'Rating updated successfully' });
    } else {
      await pool.query(
        'INSERT INTO ratings (user_id, store_id, rating) VALUES ($1, $2, $3)',
        [req.user.id, storeId, rating]
      );
      res.status(201).json({ message: 'Rating submitted successfully' });
    }

  } catch (error) {
    console.error('Rate store error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin dashboard stats
app.get('/api/admin/dashboard', auth, requireRole(['admin']), async (req, res) => {
  try {
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    const storesCount = await pool.query('SELECT COUNT(*) FROM stores');
    const ratingsCount = await pool.query('SELECT COUNT(*) FROM ratings');

    res.json({
      totalUsers: parseInt(usersCount.rows[0].count),
      totalStores: parseInt(storesCount.rows[0].count),
      totalRatings: parseInt(ratingsCount.rows[0].count)
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all users for admin
app.get('/api/admin/users', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { search, role } = req.query;

    let query = 'SELECT id, name, email, address, role FROM users WHERE 1=1';
    const params = [];

    if (search) {
      query += ` AND (name ILIKE $${params.length + 1} OR email ILIKE $${params.length + 1} OR address ILIKE $${params.length + 1})`;
      params.push(`%${search}%`);
    }

    if (role) {
      query += ` AND role = $${params.length + 1}`;
      params.push(role);
    }

    query += ' ORDER BY name';

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all stores for admin
app.get('/api/admin/stores', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { search } = req.query;

    let query = `
      SELECT s.*, 
        COALESCE(AVG(r.rating), 0) as average_rating,
        u.name as owner_name
      FROM stores s
      LEFT JOIN ratings r ON s.id = r.store_id
      LEFT JOIN users u ON s.owner_id = u.id
    `;

    const params = [];

    if (search) {
      query += ` WHERE s.name ILIKE $1 OR s.email ILIKE $1 OR s.address ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ` GROUP BY s.id, u.name ORDER BY s.name`;

    const result = await pool.query(query, params);
    res.json(result.rows);

  } catch (error) {
    console.error('Get stores admin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Store owner dashboard
app.get('/api/store-owner/dashboard', auth, requireRole(['store_owner']), async (req, res) => {
  try {
    const storeResult = await pool.query(
      `SELECT s.*, COALESCE(AVG(r.rating), 0) as average_rating
       FROM stores s 
       LEFT JOIN ratings r ON s.id = r.store_id 
       WHERE s.owner_id = $1 
       GROUP BY s.id`,
      [req.user.id]
    );

    if (storeResult.rows.length === 0) {
      return res.status(404).json({ error: 'No store found for this user' });
    }

    const store = storeResult.rows[0];

    const ratingsResult = await pool.query(
      `SELECT r.*, u.name as user_name, u.email as user_email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [store.id]
    );

    res.json({
      store: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: parseFloat(store.average_rating).toFixed(1)
      },
      ratings: ratingsResult.rows
    });

  } catch (error) {
    console.error('Store owner dashboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`✅ Health check: http://localhost:${port}/api/health`);
  console.log(`🗄️ Database: Neon PostgreSQL`);
});