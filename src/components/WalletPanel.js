import React, { useState } from 'react';
import './TransactionForm.css';
import './wallet/wallet.css';
import { useWalletContext } from '../context/WalletContext';
import SwitchWalletModal from './SwitchWalletModal';
import WalletOnboarding from './wallet/WalletOnboarding';
import UnlockScreen from './wallet/UnlockScreen';

const WalletPanel = () => {
  const {
    wallet,
    allWallets,
    balance,
    hasVault,
    isLocked,
    generateMnemonic,
    isHdWallet,
    createHdWallet,
    importHdWallet,
    importPrivateKey,
    unlock,
    lock,
    addAccount,
    switchWallet,
    forgetWallet,
  } = useWalletContext();

  const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);
  const [copied, setCopied] = useState('');
  const [revealKey, setRevealKey] = useState(false);

  const copy = (value, field) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(field);
      window.setTimeout(() => setCopied(''), 1500);
    }).catch(() => {});
  };

  const renderBody = () => {
    if (!hasVault) {
      return (
        <WalletOnboarding
          generateMnemonic={generateMnemonic}
          onCreate={createHdWallet}
          onImportMnemonic={importHdWallet}
          onImportPrivateKey={importPrivateKey}
        />
      );
    }

    if (isLocked || !wallet) {
      return <UnlockScreen onUnlock={unlock} onForget={forgetWallet} />;
    }

    return (
      <div>
        <div className="account-summary">
          <div className="account-label">Account #{wallet.index + 1}</div>
          <div className="account-address">{wallet.publicKey}</div>
          <div className="account-label">Balance</div>
          <div className="account-balance">{balance ?? '—'}</div>
        </div>

        <div className="wallet-button-row">
          <button type="button" className="secondary-button" onClick={() => copy(wallet.publicKey, 'address')}>
            {copied === 'address' ? 'Copied!' : 'Copy Address'}
          </button>
          <button type="button" className="secondary-button" onClick={() => setIsSwitchModalOpen(true)} disabled={allWallets.length <= 1}>
            Switch ({allWallets.length})
          </button>
        </div>

        <div className="wallet-button-row" style={{ marginTop: 10 }}>
          {isHdWallet() && (
            <button type="button" className="secondary-button" onClick={addAccount}>Add Account</button>
          )}
          <button type="button" className="secondary-button" onClick={lock}>Lock</button>
        </div>

        <button type="button" className="link-button" onClick={() => setRevealKey((v) => !v)}>
          {revealKey ? 'Hide private key' : 'Reveal private key'}
        </button>
        {revealKey && (
          <div className="reveal-box" onClick={() => copy(wallet.privateKeyHex, 'privateKey')} title="Click to copy">
            {wallet.privateKeyHex} {copied === 'privateKey' ? '(copied)' : ''}
          </div>
        )}

        <SwitchWalletModal
          isOpen={isSwitchModalOpen}
          onClose={() => setIsSwitchModalOpen(false)}
          wallets={allWallets}
          currentWallet={wallet}
          onSwitch={switchWallet}
        />
      </div>
    );
  };

  return (
    <div className="transaction-form">
      <h2 className="panel-title">Wallet</h2>
      {renderBody()}
    </div>
  );
};

export default WalletPanel;
