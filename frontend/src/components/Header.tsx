import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>VMarket</h1>
        </Link>
        
        {isAuthenticated && (
          <nav className="nav">
            <Link to="/">Home</Link>
            <Link to="/my-products">My Products</Link>
            <Link to="/add-product">Add Product</Link>
            <Link to="/export-requests">Export Requests</Link>
          </nav>
        )}
        
        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-info">
              <span>Welcome, {user?.name}</span>
              <button onClick={handleLogout}>Logout</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;