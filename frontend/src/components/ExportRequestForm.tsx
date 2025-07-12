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
    fetchShops();
  }, []);

  const fetchShops = async () => {
    try {
      const response = await shopkeeperService.getAll();
      // Filter out current user's shop
      const otherShops = response.data.filter(shop => shop.id !== user?.id);
      setShops(otherShops);
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
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h3>Request Product Export</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          <div className="product-info">
            <h4>{product.name}</h4>
            <p>Available Quantity: {product.quantity}</p>
            <p>Price: ₹{product.price}</p>
          </div>

          <form onSubmit={handleSubmit}>
            {error && <div className="error">{error}</div>}

            <div className="form-group">
              <label htmlFor="toShop">Send to Shop *</label>
              <select
                id="toShop"
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                required
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
                max={product.quantity}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="message">Message (Optional)</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="Add a message for the receiving shop..."
              />
            </div>

            <div className="form-actions">
              <button type="button" onClick={onClose}>
                Cancel
              </button>
              <button type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExportRequestForm;