import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../config';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadStores();
  }, []);

  const loadStores = async () => {
    try {
      const response = await axios.get('${API_BASE_URL}/api/user/stores', {
        params: { search: searchTerm }
      });
      setStores(response.data);
    } catch (error) {
      console.error('Error loading stores:', error);
      setMessage('Error loading stores');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadStores();
  };

  const rateStore = async (storeId, rating) => {
    try {
      await axios.post(`${API_BASE_URL}/api/user/stores/${storeId}/rate`, {
        rating
      });
      setMessage('Rating submitted successfully!');
      loadStores(); // Refresh the list
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error submitting rating');
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="container">Loading stores...</div>;
  }

  return (
    <div className="dashboard">
      <h1>Store Directory</h1>
      <p>Browse and rate your favorite stores</p>

      {message && (
        <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
          {message}
        </div>
      )}

      <div className="search-filter">
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '1rem', width: '100%' }}>
          <input
            type="text"
            placeholder="Search stores by name or address..."
            value={searchTerm}
            onChange={handleSearch}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>
      </div>

      <div className="stores-list">
        {filteredStores.map(store => (
          <div key={store.id} className="store-card" style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1rem',
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            border: '1px solid #e9ecef'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ color: '#2c3e50', marginBottom: '0.5rem' }}>{store.name}</h3>
                <p style={{ color: '#6c757d', marginBottom: '0.5rem' }}>{store.address}</p>
                <div className="rating-stars">
                  Overall Rating: ⭐ {parseFloat(store.average_rating).toFixed(1)}/5.0
                </div>
                {store.user_rating && (
                  <div style={{ color: '#3498db', marginTop: '0.5rem' }}>
                    Your Rating: ⭐ {store.user_rating}/5
                  </div>
                )}
              </div>
            </div>

            <div className="rating-input">
              <label style={{ fontWeight: '600', color: '#2c3e50' }}>Rate this store:</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    className={`star-button ${store.user_rating === star ? 'active' : ''}`}
                    onClick={() => rateStore(store.id, star)}
                  >
                    ⭐ {star}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="no-data">
          {searchTerm ? 'No stores found matching your search' : 'No stores available'}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;