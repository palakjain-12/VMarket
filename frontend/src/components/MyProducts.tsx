import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productService } from "../services/api";
import { Product } from "../types";
import ProductCard from "./ProductCard";

const MyProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      setLoading(true); // Set loading to true to indicate data is being fetched
      // Force a fresh request to ensure we get the latest data
      const response = await productService.getMyProducts();
      setProducts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const handleProductUpdate = () => {
    fetchMyProducts(); // Refresh the list
  };

  if (loading) return <div className="loading">Loading your products...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="container">
      <div className="page-header">
        <h1>My Products</h1>
        <div className="header-actions">
          <Link to="/add-product" className="btn btn-primary">
            <span className="icon">+</span> Add New Product
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <div className="icon">📦</div>
          <h3>No Products Yet</h3>
          <p>You haven't added any products to your inventory yet.</p>
          <Link to="/add-product" className="btn btn-primary">
            Add Your First Product
          </Link>
        </div>
      ) : (
        <div className="products-grid">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showActions={true}
              showExportButton={false}
              showSendButton={true}
              onUpdate={handleProductUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;
