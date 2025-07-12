import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { productService, shopkeeperService } from '../services/api';
import { Product, Shopkeeper } from '../types';
import ProductCard from './ProductCard';

const ShopProducts: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [shop, setShop] = useState<Shopkeeper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (shopId) {
      fetchShopData();
    }
  }, [shopId]);

  const fetchShopData = async () => {
    try {
      const [shopResponse, productsResponse] = await Promise.all([
        shopkeeperService.getById(shopId!),
        productService.getByShop(shopId!)
      ]);
      
      setShop(shopResponse);
      setProducts(productsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch shop data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading shop products...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="shop-products">
      {shop && (
        <div className="shop-header">
          <h1>{shop.shopName}</h1>
          <p><strong>Owner:</strong> {shop.name}</p>
          <p><strong>Address:</strong> {shop.address}</p>
          {shop.phone && <p><strong>Phone:</strong> {shop.phone}</p>}
        </div>
      )}

      <div className="products-section">
        <h2>Products ({products.length})</h2>
        {products.length === 0 ? (
          <p>No products available in this shop.</p>
        ) : (
          <div className="products-grid">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                showActions={false}
                showExportButton={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopProducts;