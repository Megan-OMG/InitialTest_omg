import React, { useState } from 'react';
import './wallet.css';
import PasswordFields, { validatePasswords } from './PasswordFields';

const ImportWalletFlow = ({ onImportMnemonic, onImportPrivateKey, onBack }) => {
  const [mode, setMode] = useState(null); // 'phrase' | 'privateKey'
  const [secret, setSecret] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleImport = async () => {
    if (!secret.trim()) return setError(mode === 'phrase' ? 'Enter your recovery phrase' : 'Enter your private key');
    const pwErr = validatePasswords(password, confirm);
    if (pwErr) return setError(pwErr);
    setError('');
    setBusy(true);
    try {
      if (mode === 'phrase') await onImportMnemonic(secret, password);
      else await onImportPrivateKey(secret, password);
    } catch (err) {
      setError(err.message || 'Import failed');
      setBusy(false);
    }
  };

  if (!mode) {
    return (
      <div>
        <p className="panel-subtitle">How would you like to import your wallet?</p>
        <div className="wallet-choice">
          <button type="button" className="choice-button" onClick={() => { setMode('phrase'); setError(''); }}>
            <span className="choice-title">Recovery Phrase</span>
            <span className="choice-desc">Import an HD wallet from a 12-word phrase (supports multiple accounts).</span>
          </button>
          <button type="button" className="choice-button" onClick={() => { setMode('privateKey'); setError(''); }}>
            <span className="choice-title">Private Key</span>
            <span className="choice-desc">Import a single account from a raw private key.</span>
          </button>
        </div>
        <button type="button" className="link-button" onClick={onBack}>Back</button>
      </div>
    );
  }

  return (
    <div>
      <div className="form-group">
        <label>{mode === 'phrase' ? 'Recovery Phrase' : 'Private Key (hex)'}</label>
        {mode === 'phrase' ? (
          <textarea
            rows={3}
            value={secret}
            onChange={(e) => { setSecret(e.target.value); setError(''); }}
            placeholder="word1 word2 word3 ... word12"
            autoComplete="off"
          />
        ) : (
          <input
            type="text"
            value={secret}
            onChange={(e) => { setSecret(e.target.value); setError(''); }}
            placeholder="64-character hex private key"
            autoComplete="off"
          />
        )}
      </div>
      <p className="panel-subtitle">Set a password to encrypt this wallet on your device.</p>
      <PasswordFields
        password={password}
        confirm={confirm}
        onPasswordChange={setPassword}
        onConfirmChange={setConfirm}
      />
      {error && <div className="form-message error">{error}</div>}
      <div className="wallet-button-row">
        <button type="button" className="secondary-button" onClick={() => { setMode(null); setSecret(''); setError(''); }} disabled={busy}>Back</button>
        <button type="button" className="submit-button" onClick={handleImport} disabled={busy}>
          {busy ? 'Importing...' : 'Import Wallet'}
        </button>
      </div>
    </div>
  );
};

export default ImportWalletFlow;
