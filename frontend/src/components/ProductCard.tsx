import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Product } from "../types";
import { productService } from "../services/api";
import ExportRequestForm, { ExportFormType } from "./ExportRequestForm";
import Modal from "./Modal";
import { useAuth } from "../contexts/AuthContext";

interface ProductCardProps {
  product: Product;
  showActions?: boolean;
  showExportButton?: boolean; // For requesting products from other shops
  showSendButton?: boolean; // For sending my products to other shops
  onUpdate?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  showActions = true,
  showExportButton = false,
  showSendButton = false,
  onUpdate,
}) => {
  const [showExportForm, setShowExportForm] = useState(false);
  const [exportFormType, setExportFormType] = useState<ExportFormType>(
    ExportFormType.REQUEST_FROM_OTHER,
  );
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const openExportForm = useCallback(
    (type: ExportFormType) => (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setExportFormType(type);
      setShowExportForm(true);
    },
    [],
  );

  const closeExportForm = useCallback(() => {
    setShowExportForm(false);
  }, []);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      setLoading(true);
      try {
        await productService.delete(product.id);
        if (onUpdate) onUpdate();
      } catch (err) {
        console.error("Failed to delete product:", err);
        alert("Failed to delete product");
      } finally {
        setLoading(false);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN");
  };

  return (
    <div className="product-card">
      <div className="product-header">
        <h3>{product.name}</h3>
        {product.category && (
          <span className="category">{product.category}</span>
        )}
      </div>

      <div className="product-details">
        {product.description && (
          <p className="description">{product.description}</p>
        )}

        <div className="product-info">
          <p>
            <strong>Price:</strong> {formatPrice(product.price)}
          </p>
          <p>
            <strong>Quantity:</strong> {product.quantity} units
            {product.availableQuantity !== undefined &&
              product.availableQuantity !== product.quantity && (
                <span className="available-quantity">
                  {" "}
                  (Available: {product.availableQuantity} units)
                </span>
              )}
          </p>
          {product.expiryDate && (
            <p>
              <strong>Expires:</strong> {formatDate(product.expiryDate)}
            </p>
          )}
        </div>

        {product.shopkeeper && (
          <div className="shop-info">
            <p>
              <strong>Shop:</strong> {product.shopkeeper.shopName}
            </p>
            <p>
              <strong>Owner:</strong> {product.shopkeeper.name}
            </p>
          </div>
        )}
      </div>

      {(showActions || showExportButton) && (
        <div className="product-actions">
          {showActions && (
            <>
              <Link
                to={`/edit-product/${product.id}`}
                className="btn btn-primary"
              >
                Edit
              </Link>
              <button
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </>
          )}

          {showExportButton && (
            <button
              className="btn btn-success"
              onClick={openExportForm(ExportFormType.REQUEST_FROM_OTHER)}
            >
              Request Export
            </button>
          )}

          {showSendButton && (
            <button
              className="btn btn-primary"
              onClick={openExportForm(ExportFormType.SEND_MY_PRODUCT)}
            >
              Send to Shop
            </button>
          )}
        </div>
      )}

      <Modal
        isOpen={showExportForm}
        onClose={closeExportForm}
        title={
          exportFormType === ExportFormType.REQUEST_FROM_OTHER
            ? "Request Product Export"
            : "Send Product to Shop"
        }
      >
        <div className="product-info">
          <h4>{product.name}</h4>
          <p>
            <strong>Available Quantity:</strong>{" "}
            {product.availableQuantity !== undefined
              ? product.availableQuantity
              : product.quantity}{" "}
            units
          </p>
          {exportFormType === ExportFormType.REQUEST_FROM_OTHER ? (
            <p>
              <strong>From Shop:</strong> {product.shopkeeper?.shopName}
            </p>
          ) : (
            <p>
              <strong>Your Shop:</strong> {user?.shopName}
            </p>
          )}
        </div>
        <ExportRequestForm
          product={product}
          onClose={closeExportForm}
          formType={exportFormType}
          onSuccess={() => {
            closeExportForm();
            alert(
              exportFormType === ExportFormType.REQUEST_FROM_OTHER
                ? "Export request sent successfully!"
                : "Product export initiated successfully!",
            );
            if (onUpdate) onUpdate();
          }}
        />
      </Modal>
    </div>
  );
};

export default ProductCard;
