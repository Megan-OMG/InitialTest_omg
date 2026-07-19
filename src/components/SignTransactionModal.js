import React, { useState } from 'react';
import './SignTransactionModal.css';

const truncate = (value, head = 10, tail = 8) => {
  if (!value) return '';
  if (value.length <= head + tail) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
};

const SignTransactionModal = ({ isOpen, onClose, details, onConfirm }) => {
  const [signing, setSigning] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setSigning(true);
    setError('');
    try {
      await onConfirm();
    } catch (err) {
      setError(err.message || 'Failed to sign transaction');
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={signing ? undefined : onClose}>
      <div className="modal-card sign-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Sign Transaction</h3>
          <button type="button" className="modal-close" onClick={onClose} disabled={signing} aria-label="Close">
            x
          </button>
        </div>

        <p className="sign-intro">
          Review and sign this transaction with your wallet's private key. Your key never leaves this browser.
        </p>

        <div className="sign-details">
          <div className="sign-row">
            <span className="sign-label">From</span>
            <span className="sign-value" title={details.fromAddress}>{truncate(details.fromAddress)}</span>
          </div>
          <div className="sign-row">
            <span className="sign-label">To</span>
            <span className="sign-value" title={details.toAddress}>{truncate(details.toAddress)}</span>
          </div>
          <div className="sign-row">
            <span className="sign-label">Amount</span>
            <span className="sign-value amount">{details.amount}</span>
          </div>
        </div>

        {error && <div className="form-message error">{error}</div>}

        <div className="sign-actions">
          <button type="button" className="secondary-button" onClick={onClose} disabled={signing}>
            Cancel
          </button>
          <button type="button" className="submit-button" onClick={handleConfirm} disabled={signing}>
            {signing ? 'Signing...' : 'Sign & Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignTransactionModal;
