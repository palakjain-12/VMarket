import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <h1>VMarket</h1>
        </Link>

        {isAuthenticated && (
          <nav className="nav">
            <Link to="/" className={isActive("/") ? "active" : ""}>
              Home
            </Link>
            <Link
              to="/my-products"
              className={isActive("/my-products") ? "active" : ""}
            >
              My Products
            </Link>
            <Link
              to="/add-product"
              className={isActive("/add-product") ? "active" : ""}
            >
              Add Product
            </Link>
            <Link
              to="/export-requests"
              className={isActive("/export-requests") ? "active" : ""}
            >
              Export Requests
            </Link>
          </nav>
        )}

        <div className="header-actions">
          {isAuthenticated ? (
            <div className="user-info">
              <span>Welcome, {user?.name}</span>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
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
