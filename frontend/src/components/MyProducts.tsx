import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService } from '../services/api';
import { Product } from '../types';
import ProductCard from './ProductCard';

const MyProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyProducts();
  }, []);

  const fetchMyProducts = async () => {
    try {
      const response = await productService.getMyProducts();
      setProducts(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleProductUpdate = () => {
    fetchMyProducts(); // Refresh the list
  };

  if (loading) return <div className="loading">Loading your products...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="my-products">
      <div className="page-header">
        <h1>My Products</h1>
        <Link to="/add-product" className="btn btn-primary">
          Add New Product
        </Link>
      </div>

      {products.length === 0 ? (
        <div className="empty-state">
          <p>You haven't added any products yet.</p>
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
              showExportButton={true}
              onUpdate={handleProductUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyProducts;