import React, { useState } from 'react';
import './TransactionForm.css';
import { addTransaction } from '../api/blockchain.api';
import { useWalletContext } from '../context/WalletContext';
import { signTransaction } from '../utils/signing';
import SignTransactionModal from './SignTransactionModal';

const TransactionForm = ({ onTransactionAdded }) => {
  const { wallet, balance, refreshBalance } = useWalletContext();
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);

  const fromAddress = wallet?.publicKey || '';
  const parsedAmount = parseFloat(amount);
  const hasWallet = !!wallet;
  const availableBalance = balance ?? 0;

  const amountError =
    amount !== '' && !Number.isNaN(parsedAmount) && parsedAmount > availableBalance
      ? `Amount exceeds balance (${availableBalance})`
      : '';

  const canSubmit =
    hasWallet &&
    toAddress.trim() !== '' &&
    !Number.isNaN(parsedAmount) &&
    parsedAmount > 0 &&
    parsedAmount <= availableBalance;

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    if (!canSubmit) return;
    setIsSignModalOpen(true);
  };

  const handleSignAndSend = async () => {
    const timestamp = Date.now();
    const normalizedAmount = parsedAmount;

    // Sign locally
    const signature = signTransaction({
      privateKeyHex: wallet.privateKeyHex,
      fromAddress,
      toAddress: toAddress.trim(),
      amount: normalizedAmount,
      timestamp,
    });

    const response = await addTransaction(fromAddress, toAddress.trim(), normalizedAmount, signature, timestamp);

    setIsSignModalOpen(false);
    const hash = response?.transactionHash;
    setMessage(hash ? `Transaction submitted! Hash: ${hash}` : 'Transaction added successfully!');
    setToAddress('');
    setAmount('');
    onTransactionAdded();
    refreshBalance();
  };

  return (
    <div className="transaction-form">
      <h2 className="panel-title">Create Transaction</h2>

      <form onSubmit={handleSubmit}>
        <p className="panel-subtitle">Send funds from your selected wallet. The transaction is signed locally before it is sent.</p>

        <div className="form-group">
          <label htmlFor="fromAddress">From Address</label>
          <input
            type="text"
            id="fromAddress"
            name="fromAddress"
            value={fromAddress}
            placeholder="Select or create a wallet first"
            readOnly
          />
          {hasWallet && (
            <div className="wallet-note">Balance: {availableBalance}</div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="toAddress">To Address</label>
          <input
            type="text"
            id="toAddress"
            name="toAddress"
            value={toAddress}
            onChange={(e) => { setToAddress(e.target.value); setMessage(''); }}
            placeholder="e.g., recipient public key"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setMessage(''); }}
            placeholder="e.g., 100"
            step="0.01"
            min="0"
            required
          />
          {amountError && <div className="form-message error">{amountError}</div>}
        </div>

        {!hasWallet && (
          <div className="form-message error">Create or select a wallet to send a transaction.</div>
        )}

        {message && (
          <div className={`form-message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <button type="submit" className="submit-button" disabled={!canSubmit}>
          Add Transaction
        </button>
      </form>

      <SignTransactionModal
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        details={{ fromAddress, toAddress: toAddress.trim(), amount: parsedAmount }}
        onConfirm={handleSignAndSend}
      />
    </div>
  );
};

export default TransactionForm;
