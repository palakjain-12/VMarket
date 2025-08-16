import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { shopkeeperService } from "../services/api";
import { Shopkeeper } from "../types";
import { useAuth } from "../contexts/AuthContext";

const Home: React.FC = () => {
  const [shops, setShops] = useState<Shopkeeper[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { user } = useAuth();

  useEffect(() => {
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await shopkeeperService.getAll();
      setShops(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch shops");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading shops...</p>
      </div>
    );

  if (error)
    return (
      <div className="error">
        <p>Error: {error}</p>
      </div>
    );

  return (
    <div className="home">
      <div className="hero">
        <h1>Welcome to VMarket</h1>
        <p>Connecting shops in your market for better inventory management</p>
        {user && (
          <div className="user-greeting">
            <h2>Hello, {user.name}!</h2>
            <p>Shop: {user.shopName}</p>
          </div>
        )}
      </div>

      {user && (
        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/my-products" className="action-card">
              <h3>My Products</h3>
              <p>Manage your shop's inventory</p>
              <button className="btn btn-primary">View Products</button>
            </Link>
            <Link to="/add-product" className="action-card">
              <h3>Add Product</h3>
              <p>Add new items to your shop</p>
              <button className="btn btn-primary">Add New</button>
            </Link>
            <Link to="/export-requests" className="action-card">
              <h3>Export Requests</h3>
              <p>Manage product transfer requests</p>
              <button className="btn btn-primary">View Requests</button>
            </Link>
          </div>
        </div>
      )}

      <div className="shops-section">
        <h2>Registered Shops</h2>
        <div className="shops-grid">
          {shops.length > 0 ? (
            shops.map((shop) => (
              <div key={shop.id} className="shop-card">
                <h3>{shop.shopName}</h3>
                <p>
                  <strong>Owner:</strong> {shop.name}
                </p>
                <p>
                  <strong>Address:</strong> {shop.address}
                </p>
                {shop.phone && (
                  <p>
                    <strong>Phone:</strong> {shop.phone}
                  </p>
                )}
                <Link to={`/shop/${shop.id}`} className="btn btn-primary">
                  View Products
                </Link>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <p>No shops registered yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
