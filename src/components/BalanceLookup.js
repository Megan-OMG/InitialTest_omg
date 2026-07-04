import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { fetchBalance } from '../api/blockchain.api';
import { truncateHash } from '../utils/formatters';
import './Panel.css';

const BalanceLookup = () => {
  const [address, setAddress] = useState('');
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    setError('');
    setBalance(null);

    try {
      const result = await fetchBalance(address.trim());
      setBalance(result.balance);
    } catch (err) {
      setError(err.message || 'Lookup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.05, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h2 className="panel-title">Balance Lookup</h2>
      <p className="panel-subtitle">Check the balance of any address on the chain.</p>

      <form onSubmit={handleLookup}>
        <div className="form-group">
          <label htmlFor="lookupAddress">Address</label>
          <input
            type="text"
            id="lookupAddress"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Paste a public key"
            className="input mono"
          />
        </div>

        {error && <div className="form-message error">{error}</div>}

        {balance !== null && (
          <div className="lookup-result">
            <span className="lookup-label">Balance</span>
            <span className="lookup-balance">{balance}</span>
            <span className="lookup-address mono" title={address.trim()}>
              {truncateHash(address.trim(), 12)}
            </span>
          </div>
        )}

        <button type="submit" className="btn btn-secondary" disabled={loading || !address.trim()}>
          {loading ? 'Looking up…' : 'Look Up Balance'}
        </button>
      </form>
    </motion.div>
  );
};

export default BalanceLookup;
