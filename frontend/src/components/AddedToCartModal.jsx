import React from 'react';
import { useNavigate } from 'react-router-dom';

const AddedToCartModal = ({ show, product, onClose }) => {
  const navigate = useNavigate();
  if (!show) return null;

  return (
    <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.4)' }}>
      <div className="modal-dialog modal-sm modal-dialog-centered">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Added to cart</h5>
            <button type="button" className="btn-close" aria-label="Close" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <img src={product?.imageUrl || '/assets/unplugged.png'} alt={product?.name} style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 6 }} />
              <div>
                <div style={{ fontWeight: 700 }}>{product?.name}</div>
                <div className="text-muted" style={{ fontSize: '.9rem' }}>${product?.price}</div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>Continue shopping</button>
            <button className="btn btn-primary" onClick={() => navigate('/cart')}>Go to cart</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddedToCartModal;
