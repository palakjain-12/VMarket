import React, { useState, useEffect } from 'react';
import { shopkeeperService, exportRequestService } from '../services/api';
import { Product, Shopkeeper } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface ExportRequestFormProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}

const ExportRequestForm: React.FC<ExportRequestFormProps> = ({
  product,
  onClose,
  onSuccess,
}) => {
  const [shops, setShops] = useState<Shopkeeper[]>([]);
  const [selectedShopId, setSelectedShopId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    // Fetch shops data when component mounts
    fetchShops();
    
    // Use availableQuantity if it exists, otherwise use quantity
    const availableQty = product.availableQuantity !== undefined ? product.availableQuantity : product.quantity;
    
    // Set initial quantity to 1 (default) or half of available quantity if product has more than 2 units
    if (availableQty > 2) {
      setQuantity(Math.floor(availableQty / 2));
    } else {
      setQuantity(Math.min(1, availableQty));
    }
  }, [product.quantity, product.availableQuantity]);

  const fetchShops = async () => {
    try {
      const response = await shopkeeperService.getAll();
      // If this is the user's own product, filter out their own shop
      // Otherwise, include all shops for export requests
      const isOwnProduct = product.shopkeeper?.id === user?.id;
      const filteredShops = isOwnProduct
        ? response.data.filter(shop => shop.id !== user?.id)
        : response.data;
      setShops(filteredShops);
    } catch (err: any) {
      setError('Failed to fetch shops');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await exportRequestService.create({
        productId: product.id,
        toShopId: selectedShopId,
        quantity,
        message: message || undefined,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send export request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="export-form">
      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label htmlFor="toShop">Send to Shop *</label>
        <select
          id="toShop"
          value={selectedShopId}
          onChange={(e) => setSelectedShopId(e.target.value)}
          required
          className="form-control"
        >
          <option value="">Select Shop</option>
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.shopName} - {shop.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="quantity">Quantity *</label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          min="1"
          max={product.availableQuantity !== undefined ? product.availableQuantity : product.quantity}
          required
          className="form-control"
        />
        <small className="form-text">Maximum available: {product.availableQuantity !== undefined ? product.availableQuantity : product.quantity} units</small>
      </div>

      <div className="form-group">
        <label htmlFor="message">Message (Optional)</label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="Add a message for the receiving shop..."
          className="form-control"
        />
      </div>

      <div className="form-actions">
        <button 
          type="button" 
          onClick={onClose}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Sending...' : 'Send Request'}
        </button>
      </div>
    </form>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(ExportRequestForm);