import React, { useState } from 'react';
import './wallet.css';
import CreateWalletFlow from './CreateWalletFlow';
import ImportWalletFlow from './ImportWalletFlow';

const WalletOnboarding = ({
  generateMnemonic,
  onCreate,
  onImportMnemonic,
  onImportPrivateKey,
}) => {
  const [choice, setChoice] = useState(null); // 'create' | 'import'

  if (choice === 'create') {
    return (
      <CreateWalletFlow
        generateMnemonic={generateMnemonic}
        onCreate={onCreate}
        onBack={() => setChoice(null)}
      />
    );
  }

  if (choice === 'import') {
    return (
      <ImportWalletFlow
        onImportMnemonic={onImportMnemonic}
        onImportPrivateKey={onImportPrivateKey}
        onBack={() => setChoice(null)}
      />
    );
  }

  return (
    <div>
      <p className="panel-subtitle">Get started by creating a new wallet or importing an existing one.</p>
      <div className="wallet-choice">
        <button type="button" className="choice-button" onClick={() => setChoice('create')}>
          <span className="choice-title">Create New Wallet</span>
          <span className="choice-desc">Generate a fresh recovery phrase and key pair.</span>
        </button>
        <button type="button" className="choice-button" onClick={() => setChoice('import')}>
          <span className="choice-title">Import Existing Wallet</span>
          <span className="choice-desc">Restore from a recovery phrase or a private key.</span>
        </button>
      </div>
    </div>
  );
};

export default WalletOnboarding;
