import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { addTransaction } from '../api/blockchain.api';
import { signTransaction } from '../utils/signing';
import './Panel.css';

const TransactionForm = ({ activeWallet, onTransactionAdded, onMiningStart, onMiningEnd }) => {
  const [formData, setFormData] = useState({
    fromAddress: '',
    toAddress: '',
    amount: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (activeWallet?.publicKey) {
      setFormData((prev) => ({ ...prev, fromAddress: activeWallet.publicKey }));
    }
  }, [activeWallet]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!activeWallet?.privateKey) {
      setMessage('Create a wallet first to sign transactions.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const { fromAddress, toAddress, amount } = formData;
      const timestamp = Date.now();
      const signature = signTransaction(
        fromAddress,
        toAddress,
        Number(amount),
        timestamp,
        activeWallet.privateKey
      );

      await addTransaction(fromAddress, toAddress, amount, signature, timestamp);
      setMessage('Transaction signed and submitted.');
      setFormData((prev) => ({ ...prev, toAddress: '', amount: '' }));
      onTransactionAdded();
    } catch (err) {
      setMessage(err.message || 'Failed to add transaction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h2 className="panel-title">Send Transaction</h2>
      <p className="panel-subtitle">
        Transactions are signed locally with your private key before submission.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fromAddress">From Address</label>
          <input
            type="text"
            id="fromAddress"
            name="fromAddress"
            value={formData.fromAddress}
            onChange={handleChange}
            placeholder="Auto-filled from active wallet"
            className="input mono"
            readOnly={!!activeWallet}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="toAddress">To Address</label>
          <input
            type="text"
            id="toAddress"
            name="toAddress"
            value={formData.toAddress}
            onChange={handleChange}
            placeholder="Recipient public key"
            className="input mono"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0"
            className="input"
            step="0.01"
            min="0"
            required
          />
        </div>

        {message && (
          <div className={`form-message ${message.includes('signed') || message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <button type="submit" className="btn btn-primary" disabled={loading || !activeWallet}>
          {loading ? 'Signing…' : 'Sign & Submit'}
        </button>
      </form>
    </motion.div>
  );
};

export default TransactionForm;
