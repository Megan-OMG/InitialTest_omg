import React from 'react';
import './SwitchWalletModal.css';

const truncate = (value, head = 10, tail = 8) => {
  if (!value) return '';
  if (value.length <= head + tail) return value;
  return `${value.slice(0, head)}…${value.slice(-tail)}`;
};

const SwitchWalletModal = ({ isOpen, onClose, wallets, currentWallet, onSwitch }) => {
  if (!isOpen) return null;

  const handleSelect = (walletData) => {
    onSwitch(walletData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Switch Wallet</h3>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            x
          </button>
        </div>

        {wallets.length === 0 ? (
          <p className="modal-empty">No wallets yet. Create one first.</p>
        ) : (
          <ul className="wallet-list">
            {wallets.map((walletData) => {
              const isActive = currentWallet && currentWallet.publicKey === walletData.publicKey;
              return (
                <li key={walletData.publicKey}>
                  <button
                    type="button"
                    className={`wallet-option ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelect(walletData)}
                    disabled={isActive}
                  >
                    <span className="wallet-option-key">{truncate(walletData.publicKey)}</span>
                    {isActive && <span className="wallet-option-badge">Current</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default SwitchWalletModal;
