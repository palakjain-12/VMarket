import React, { useState, useEffect } from 'react';
import { shopkeeperService, exportRequestService } from '../services/api';
import { Product, Shopkeeper } from '../types';
import { useAuth } from '../contexts/AuthContext';

// Define the form type to handle different export scenarios
export enum ExportFormType {
  REQUEST_FROM_OTHER = 'REQUEST_FROM_OTHER', // Request product from another shop to my shop
  SEND_MY_PRODUCT = 'SEND_MY_PRODUCT'  // Send my product to another shop
}

interface ExportRequestFormProps {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
  formType: ExportFormType;
}

const ExportRequestForm: React.FC<ExportRequestFormProps> = ({
  product,
  onClose,
  onSuccess,
  formType,
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
      let filteredShops: Shopkeeper[] = [];
      
      if (formType === ExportFormType.REQUEST_FROM_OTHER) {
        // For requesting products from other shops to my shop
        // Filter to only show the product owner's shop
        filteredShops = response.data.filter(shop => {
          return shop.id === product.shopkeeper?.id;
        });
      } else if (formType === ExportFormType.SEND_MY_PRODUCT) {
        // For sending my products to other shops
        // Filter out my own shop
        filteredShops = response.data.filter(shop => {
          return shop.id !== user?.id;
        });
      }
      
      setShops(filteredShops);
      
      // If there are shops available, select the first one by default
      if (filteredShops.length > 0) {
        setSelectedShopId(filteredShops[0].id);
      }
    } catch (err: any) {
      setError('Failed to fetch shops');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // For both scenarios, we use the same API endpoint but with different parameters
      // The backend will handle the request based on the fromShopId and toShopId
      if (formType === ExportFormType.REQUEST_FROM_OTHER) {
        // When requesting from another shop to my shop
        await exportRequestService.create({
          productId: product.id,
          toShopId: selectedShopId, // The product owner's shop
          quantity,
          message: message || undefined,
        });
      } else if (formType === ExportFormType.SEND_MY_PRODUCT) {
        // When sending my product to another shop
        await exportRequestService.create({
          productId: product.id,
          toShopId: selectedShopId, // The target shop
          quantity,
          message: message || undefined,
        });
      }
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
        <label htmlFor="toShop">
          {formType === ExportFormType.REQUEST_FROM_OTHER 
            ? "Request From Shop *" 
            : "Send To Shop *"}
        </label>
        <select
          id="toShop"
          value={selectedShopId}
          onChange={(e) => setSelectedShopId(e.target.value)}
          required
          className="form-control"
          disabled={shops.length === 1} // Disable if there's only one option
        >
          <option value="">Select Shop</option>
          {shops.map((shop) => (
            <option key={shop.id} value={shop.id}>
              {shop.shopName} - {shop.name}
            </option>
          ))}
        </select>
        <small className="form-text">
          {formType === ExportFormType.REQUEST_FROM_OTHER 
            ? "This is the shop that owns the product you want to export" 
            : "This is the shop that will receive your product"}
        </small>
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
          {loading ? 'Sending...' : formType === ExportFormType.REQUEST_FROM_OTHER 
            ? 'Send Request' 
            : 'Export Product'}
        </button>
      </div>
    </form>
  );
};

// Use React.memo to prevent unnecessary re-renders
export default React.memo(ExportRequestForm);