import React, { useState } from 'react';
import './TransactionForm.css';
import { createWallet, fetchBalance } from '../api/blockchain.api';

const WalletPanel = () => {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleCreateWallet = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await createWallet();
      const walletData = response;
      setWallet(walletData);
      const balanceResponse = await fetchBalance(walletData.publicKey);
      setBalance(balanceResponse.balance);
      setMessage('Wallet created successfully');
    } catch (err) {
      setMessage(err.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-form">
      <h2 className="panel-title">Wallet Studio</h2>
      <p className="panel-subtitle">Generate a key pair and inspect balance.</p>

      <button type="button" className="submit-button" onClick={handleCreateWallet} disabled={loading}>
        {loading ? 'Generating...' : 'Create Wallet'}
      </button>

      {message && <div className={`form-message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>}

      {wallet && (
        <div className="form-group">
          <label>Public Key</label>
          <div className="field-value hash">{wallet.publicKey}</div>
          <label>Private Key</label>
          <div className="field-value hash">{wallet.privateKey}</div>
          <label>Balance</label>
          <div className="field-value">{balance}</div>
        </div>
      )}
    </div>
  );
};

export default WalletPanel;
