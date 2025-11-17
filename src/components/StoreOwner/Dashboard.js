import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

const StoreOwnerDashboard = () => {
  const [storeData, setStoreData] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStoreData();
  }, []);

  const loadStoreData = async () => {
    try {
      const response = await axios.get('${API_BASE_URL}/api/store-owner/dashboard');
      setStoreData(response.data.store);
      setRatings(response.data.ratings);
    } catch (error) {
      console.error('Error loading store data:', error);
      setError(error.response?.data?.error || 'Error loading store data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading your store data...</div>;
  }

  if (error) {
    return (
      <div className="container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!storeData) {
    return (
      <div className="container">
        <div className="error-message">No store found for your account</div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <h1>My Store Dashboard</h1>
      <p>Monitor your store ratings and customer feedback</p>

      <div className="store-info">
        <h2>{storeData.name}</h2>
        <p><strong>Email:</strong> {storeData.email}</p>
        <p><strong>Address:</strong> {storeData.address}</p>
        <p><strong>Average Rating:</strong> ⭐ {storeData.averageRating}/5.0</p>
      </div>

      <div className="section-header">
        <h2>Customer Ratings ({ratings.length})</h2>
      </div>

      <div className="ratings-list">
        {ratings.map(rating => (
          <div key={rating.id} className="rating-card" style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h4 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>
                  {rating.user_name}
                </h4>
                <p style={{ color: '#6c757d', marginBottom: '0.5rem' }}>
                  {rating.user_email}
                </p>
                <div className="rating-stars" style={{ fontSize: '1.2rem' }}>
                  Rating: ⭐ {rating.rating}/5
                </div>
              </div>
              <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
                {new Date(rating.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {ratings.length === 0 && (
        <div className="no-data">
          No ratings yet for your store. Encourage customers to rate your store!
        </div>
      )}
    </div>
  );
};

export default StoreOwnerDashboard;