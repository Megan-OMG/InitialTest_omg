import React, { useState } from 'react';
import './Explorer.css';
import { searchExplorer } from '../api/blockchain.api';

const truncate = (value, head = 14, tail = 10) => {
  if (!value) return '';
  const str = String(value);
  if (str.length <= head + tail) return str;
  return `${str.slice(0, head)}…${str.slice(-tail)}`;
};

const formatSender = (from) => (from ? truncate(from) : 'Mining Reward');

const Field = ({ label, value, mono, title }) => (
  <div className="explorer-field">
    <span className="explorer-label">{label}</span>
    <span className={`explorer-value ${mono ? 'mono' : ''}`} title={title}>{value}</span>
  </div>
);

const TxRow = ({ tx }) => (
  <div className="explorer-tx-row">
    <span className="mono" title={tx.hash}>{truncate(tx.hash, 10, 8)}</span>
    <span className="mono" title={tx.fromAddress || 'Mining Reward'}>{formatSender(tx.fromAddress)}</span>
    <span className="arrow">→</span>
    <span className="mono" title={tx.toAddress}>{truncate(tx.toAddress, 10, 8)}</span>
    <span className="amount">{tx.amount}</span>
    <span className={`badge ${tx.status}`}>{tx.status}</span>
  </div>
);

const BlockResult = ({ result }) => {
  const { block, height } = result;
  return (
    <div className="explorer-result">
      <div className="explorer-result-title">Block #{height}</div>
      <Field label="Hash" value={truncate(block.hash)} mono title={block.hash} />
      <Field label="Previous Hash" value={truncate(block.previousHash)} mono title={block.previousHash} />
      <Field label="Timestamp" value={new Date(block.timestamp).toLocaleString()} />
      <Field label="Nonce" value={block.nonce} />
      <Field label="Transactions" value={block.transactions.length} />
      {block.transactions.length > 0 && (
        <div className="explorer-tx-list">
          {block.transactions.map((tx, i) => (
            <TxRow key={tx.hash || i} tx={{ ...tx, status: 'confirmed' }} />
          ))}
        </div>
      )}
    </div>
  );
};

const TransactionResult = ({ result }) => {
  const { transaction, status, blockHeight } = result;
  return (
    <div className="explorer-result">
      <div className="explorer-result-title">
        Transaction <span className={`badge ${status}`}>{status}</span>
      </div>
      <Field label="Hash" value={truncate(transaction.hash)} mono title={transaction.hash} />
      <Field label="From" value={formatSender(transaction.fromAddress)} mono title={transaction.fromAddress || 'Mining Reward'} />
      <Field label="To" value={truncate(transaction.toAddress)} mono title={transaction.toAddress} />
      <Field label="Amount" value={transaction.amount} />
      <Field label="Timestamp" value={new Date(transaction.timestamp).toLocaleString()} />
      <Field label="Block" value={status === 'confirmed' ? `#${blockHeight}` : 'Pending (not yet mined)'} />
    </div>
  );
};

const AddressResult = ({ result }) => (
  <div className="explorer-result">
    <div className="explorer-result-title">Address</div>
    <Field label="Address" value={truncate(result.address)} mono title={result.address} />
    <Field label="Balance" value={result.balance} />
    <Field label="Transactions" value={result.transactionCount} />
    {result.transactions.length > 0 && (
      <div className="explorer-tx-list">
        {result.transactions.map((tx, i) => (
          <TxRow key={tx.hash || i} tx={tx} />
        ))}
      </div>
    )}
  </div>
);

const Explorer = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await searchExplorer(q);
      setResult(response);
    } catch (err) {
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="explorer">
      <h2 className="panel-title">Explorer</h2>
      <p className="explorer-subtitle">Search by block hash, transaction hash, or address.</p>

      <form className="explorer-search" onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setError(''); }}
          placeholder="Paste a block hash, tx hash, or address"
        />
        <button type="submit" className="submit-button" disabled={loading || !query.trim()}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="form-message error">{error}</div>}

      {result && result.type === 'block' && <BlockResult result={result.result} />}
      {result && result.type === 'transaction' && <TransactionResult result={result.result} />}
      {result && result.type === 'address' && <AddressResult result={result.result} />}
    </div>
  );
};

export default Explorer;
