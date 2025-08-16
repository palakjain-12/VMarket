import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { productService, shopkeeperService } from "../services/api";
import { Product, Shopkeeper } from "../types";
import ProductCard from "./ProductCard";
import { useAuth } from "../contexts/AuthContext";

const ShopProducts: React.FC = () => {
  const { shopId } = useParams<{ shopId: string }>();
  const { user } = useAuth(); // Move useAuth hook to the top level
  const [products, setProducts] = useState<Product[]>([]);
  const [shop, setShop] = useState<Shopkeeper | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (shopId) {
      fetchShopData();
    }
  }, [shopId]);

  const fetchShopData = async () => {
    try {
      const [shopResponse, productsResponse] = await Promise.all([
        shopkeeperService.getById(shopId!),
        productService.getByShop(shopId!),
      ]);

      setShop(shopResponse);
      setProducts(productsResponse.data);
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to fetch shop data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading shop products...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="container">
      {shop && (
        <div className="shop-header">
          <div className="page-header">
            <h1>{shop.shopName}</h1>
            <div className="header-actions">
              <Link to="/" className="btn btn-secondary">
                <span className="icon">←</span> Back to Shops
              </Link>
            </div>
          </div>

          <div className="shop-details card">
            <div className="shop-info">
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
            </div>
          </div>
        </div>
      )}

      <div className="products-section">
        <div className="section-header">
          <h2>Available Products</h2>
          <span className="badge">{products.length}</span>
        </div>

        {products.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🛒</div>
            <h3>No Products Available</h3>
            <p>This shop doesn't have any products listed at the moment.</p>
          </div>
        ) : (
          <div className="products-grid">
            {products.map((product) => {
              // Only show export button if the product doesn't belong to the current user
              const showExportButton = user?.id !== product.shopkeeper?.id;

              return (
                <ProductCard
                  key={product.id}
                  product={product}
                  showActions={false}
                  showExportButton={showExportButton}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopProducts;
