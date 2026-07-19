import React, { useState } from 'react';
import './wallet.css';

const UnlockScreen = ({ onUnlock, onForget }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onUnlock(password);
    } catch (err) {
      setError(err.message || 'Incorrect password');
      setBusy(false);
    }
  };

  const handleForget = () => {
    if (window.confirm('This removes the wallet from this device. You can only restore it with your recovery phrase. Continue?')) {
      onForget();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <p className="panel-subtitle">Enter your password to unlock your wallet.</p>
      <div className="form-group">
        <label htmlFor="unlockPassword">Password</label>
        <input
          type="password"
          id="unlockPassword"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setError(''); }}
          placeholder="Your wallet password"
          autoComplete="current-password"
          autoFocus
        />
      </div>
      {error && <div className="form-message error">{error}</div>}
      <button type="submit" className="submit-button" disabled={busy || !password}>
        {busy ? 'Unlocking...' : 'Unlock'}
      </button>
      <div style={{ textAlign: 'center' }}>
        <button type="button" className="danger-link" onClick={handleForget}>Forget wallet on this device</button>
      </div>
    </form>
  );
};

export default UnlockScreen;
