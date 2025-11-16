# 🏪 Store Ratings Platform

A full-stack store rating application with role-based access control, built with React.js frontend, Node.js/Express.js backend, and PostgreSQL database. Features multi-user roles, store ratings, admin dashboards, and real-time filtering.

## 🚀 Features

### 👥 User Roles & Authentication
- **System Administrator** - Full platform control
- **Store Owner** - Manage store ratings and analytics  
- **Normal User** - Browse and rate stores
- JWT-based authentication & authorization

### 🎯 Core Functionality
- **Store Rating System** - 1-5 star ratings with CRUD operations
- **Role-based Dashboards** - Custom interfaces per user role
- **Advanced Filtering** - Search by name, email, address, role
- **Real-time Analytics** - Ratings overview and user insights

### 💻 Tech Stack
- **Frontend:** React.js, React Router, Axios, Context API
- **Backend:** Node.js, Express.js, JWT, CORS
- **Database:** PostgreSQL with proper relationships
- **Hosting:** Netlify (Frontend) + Render (Backend) + ElephantSQL (Database)

## 📋 User Roles & Permissions

### 🔧 System Administrator
- View platform statistics (users, stores, ratings)
- Manage all users and stores
- Filter users by role and search criteria
- Access comprehensive admin dashboard

### 🏬 Store Owner  
- View store performance dashboard
- See customer ratings with user details
- Monitor average store rating
- Access rating analytics

### 👤 Normal User
- Browse all registered stores
- Search stores by name and location
- Submit and modify 1-5 star ratings
- View personal rating history

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

### Backend Setup
```bash
# Clone repository
git clone https://github.com/juneikon/store-ratings-app.git
cd store-ratings-app/backend

# Install dependencies
npm install

# Environment variables (create .env file)
cp .env.example .env
# Edit .env with your database credentials

# Start development server
npm run dev
Frontend Setup
bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm start
Database Setup
sql
-- Run these commands in PostgreSQL
CREATE DATABASE store_ratings;
\c store_ratings_tab

-- The tables will be automatically created by the application
-- Sample data will be inserted on first run
🌐 Live Demo
Live Application: https://your-app.netlify.app

Demo Accounts:
Admin: admin@store.com / Admin123!
Store Owner: owner@store.com / Owner123!
User: user@test.com / User123!

📁 Project Structure
text
store-ratings-app/
├── backend/
│   ├── server.js          # Express server
│   ├── package.json       # Backend dependencies
│   └── .env              # Environment variables
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── contexts/      # Auth context
│   │   └── config.js      # API configuration
│   └── package.json      # Frontend dependencies
└── README.md


🚀 Deployment
This application is deployed using:

Frontend: Netlify
Backend: Render
Database: ElephantSQL

Environment Variables
Backend requires these environment variables:

env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=your_frontend_domain

🔧 API Endpoints
Method	Endpoint	Description	Access
POST	/api/login	User login	All
POST	/api/register	User registration	All
GET	/api/user/stores	Get stores for user	User, Admin
POST	/api/user/stores/:id/rate	Rate a store	User, Admin
GET	/api/admin/dashboard	Admin statistics	Admin
GET	/api/store-owner/dashboard	Store owner analytics	Store Owner

👨‍💻 Development
Running Locally
Setup PostgreSQL database
Configure backend environment variables
Start backend: cd backend && npm run dev
Start frontend: cd frontend && npm start
Access at: http://localhost:3000

Building for Production
cd frontend
npm run build

🤝 Contributing
Fork the project
Create your feature branch (git checkout -b feature/AmazingFeature)
Commit your changes (git commit -m 'Add some AmazingFeature')
Push to the branch (git push origin feature/AmazingFeature)
Open a Pull Request

📄 License
This project is licensed under the MIT License.

👤 Author
Nexha
GitHub: https://github.com/juneikon
LinkedIn: https://www.linkedin.com/in/omerun-nesha-khatun-mallick-a84658230/

🙏 Acknowledgments
React.js community
Express.js documentation
PostgreSQL documentation