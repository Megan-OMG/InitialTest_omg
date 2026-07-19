import React, { useState } from 'react';
import './wallet.css';
import PasswordFields, { validatePasswords } from './PasswordFields';

const pickIndices = (length, count) => {
  const chosen = new Set();
  while (chosen.size < count) chosen.add(Math.floor(Math.random() * length));
  return [...chosen].sort((a, b) => a - b);
};

const CreateWalletFlow = ({ generateMnemonic, onCreate, onBack }) => {
  const [step, setStep] = useState('password'); // password -> phrase -> confirm
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [mnemonic, setMnemonic] = useState('');
  const [saved, setSaved] = useState(false);
  const [confirmIndices, setConfirmIndices] = useState([]);
  const [confirmInputs, setConfirmInputs] = useState({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const words = mnemonic ? mnemonic.split(' ') : [];

  const handlePasswordNext = () => {
    const err = validatePasswords(password, confirm);
    if (err) return setError(err);
    setError('');
    setMnemonic(generateMnemonic());
    setStep('phrase');
  };

  const handleCopy = () => navigator.clipboard.writeText(mnemonic).catch(() => {});

  const handleDownload = () => {
    const blob = new Blob([mnemonic], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'recovery-phrase.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePhraseNext = () => {
    setConfirmIndices(pickIndices(words.length, 3));
    setConfirmInputs({});
    setError('');
    setStep('confirm');
  };

  const handleConfirm = async () => {
    const allMatch = confirmIndices.every(
      (i) => (confirmInputs[i] || '').trim().toLowerCase() === words[i]
    );
    if (!allMatch) return setError('Those words do not match your recovery phrase');
    setError('');
    setBusy(true);
    try {
      await onCreate(mnemonic, password);
    } catch (err) {
      setError(err.message || 'Failed to create wallet');
      setBusy(false);
    }
  };

  if (step === 'password') {
    return (
      <div>
        <p className="panel-subtitle">Set a password to encrypt your wallet on this device.</p>
        <PasswordFields
          password={password}
          confirm={confirm}
          onPasswordChange={setPassword}
          onConfirmChange={setConfirm}
        />
        {error && <div className="form-message error">{error}</div>}
        <div className="wallet-button-row">
          <button type="button" className="secondary-button" onClick={onBack}>Back</button>
          <button type="button" className="submit-button" onClick={handlePasswordNext}>Continue</button>
        </div>
      </div>
    );
  }

  if (step === 'phrase') {
    return (
      <div>
        <p className="panel-subtitle">Write down these 12 words in order. They restore your wallet if you lose this device.</p>
        <div className="warning-box">Never share your recovery phrase. Anyone with it controls your funds.</div>
        <div className="phrase-grid">
          {words.map((word, i) => (
            <div className="phrase-word" key={i}>
              <span className="phrase-index">{i + 1}.</span>
              <span>{word}</span>
            </div>
          ))}
        </div>
        <div className="phrase-toolbar">
          <button type="button" className="secondary-button" onClick={handleCopy}>Copy</button>
          <button type="button" className="secondary-button" onClick={handleDownload}>Download</button>
        </div>
        <label className="checkbox-row">
          <input type="checkbox" checked={saved} onChange={(e) => setSaved(e.target.checked)} />
          I have saved my recovery phrase somewhere safe
        </label>
        <div className="wallet-button-row">
          <button type="button" className="secondary-button" onClick={() => setStep('password')}>Back</button>
          <button type="button" className="submit-button" onClick={handlePhraseNext} disabled={!saved}>Continue</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="panel-subtitle">Confirm your recovery phrase by filling in the requested words.</p>
      {confirmIndices.map((i) => (
        <div className="form-group" key={i}>
          <label>Word #{i + 1}</label>
          <input
            type="text"
            value={confirmInputs[i] || ''}
            onChange={(e) => setConfirmInputs({ ...confirmInputs, [i]: e.target.value })}
            placeholder={`Enter word #${i + 1}`}
            autoComplete="off"
          />
        </div>
      ))}
      {error && <div className="form-message error">{error}</div>}
      <div className="wallet-button-row">
        <button type="button" className="secondary-button" onClick={() => setStep('phrase')} disabled={busy}>Back</button>
        <button type="button" className="submit-button" onClick={handleConfirm} disabled={busy}>
          {busy ? 'Creating...' : 'Create Wallet'}
        </button>
      </div>
    </div>
  );
};

export default CreateWalletFlow;
