import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { createWallet, fetchBalance } from '../api/blockchain.api';
import { copyToClipboard } from '../utils/signing';
import { truncateHash } from '../utils/formatters';
import './Panel.css';

const WalletPanel = ({ activeWallet, onWalletCreated }) => {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [copied, setCopied] = useState('');

  const handleCreateWallet = async () => {
    setLoading(true);
    setMessage('');
    setRevealed(false);

    try {
      const walletData = await createWallet();
      setWallet(walletData);
      setBalance(walletData.balance ?? 0);
      onWalletCreated(walletData);
      setMessage('Wallet created successfully');
    } catch (err) {
      setMessage(err.message || 'Failed to create wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text, label) => {
    await copyToClipboard(text);
    setCopied(label);
    setTimeout(() => setCopied(''), 2000);
  };

  const handleRefreshBalance = async () => {
    const target = wallet || activeWallet;
    if (!target) return;
    try {
      const result = await fetchBalance(target.publicKey);
      setBalance(result.balance);
    } catch (err) {
      setMessage(err.message || 'Failed to fetch balance');
    }
  };

  const displayWallet = wallet || activeWallet;

  return (
    <motion.div
      className="panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h2 className="panel-title">Wallet</h2>
      <p className="panel-subtitle">Generate a secp256k1 keypair and sign transactions locally.</p>

      <button type="button" className="btn btn-primary" onClick={handleCreateWallet} disabled={loading}>
        {loading ? 'Generating…' : 'Create Wallet'}
      </button>

      {message && (
        <div className={`form-message ${message.includes('success') ? 'success' : 'error'}`}>{message}</div>
      )}

      {displayWallet && (
        <div className="wallet-details">
          <div className="field-group">
            <div className="field-header">
              <label>Public Key</label>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => handleCopy(displayWallet.publicKey, 'public')}
              >
                {copied === 'public' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <div className="field-value mono" title={displayWallet.publicKey}>
              {truncateHash(displayWallet.publicKey, 16)}
            </div>
          </div>

          <div className="field-group">
            <div className="field-header">
              <label>Private Key</label>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setRevealed((v) => !v)}
              >
                {revealed ? 'Hide' : 'Reveal'}
              </button>
            </div>
            {revealed ? (
              <>
                <div className="warning-banner">
                  Never share your private key. Anyone with it can spend your funds.
                </div>
                <div className="field-value mono private-key">{displayWallet.privateKey}</div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleCopy(displayWallet.privateKey, 'private')}
                >
                  {copied === 'private' ? 'Copied' : 'Copy'}
                </button>
              </>
            ) : (
              <div className="field-value masked">••••••••••••••••••••</div>
            )}
          </div>

          <div className="field-group">
            <div className="field-header">
              <label>Balance</label>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleRefreshBalance}>
                Refresh
              </button>
            </div>
            <div className="field-value balance">{balance ?? '—'}</div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WalletPanel;
