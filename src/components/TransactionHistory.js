import React from 'react';
import { motion } from 'framer-motion';
import { truncateHash, formatAmount, formatAddress } from '../utils/formatters';
import './TransactionHistory.css';

const TransactionHistory = ({ chain }) => {
  if (!chain?.chain) return null;

  const transactions = chain.chain.flatMap((block, blockIndex) =>
    (block.transactions || []).map((tx, txIndex) => ({
      ...tx,
      blockIndex,
      key: `${blockIndex}-${txIndex}`,
    }))
  );

  if (transactions.length === 0) {
    return (
      <div className="panel transaction-history">
        <h2 className="panel-title">Transaction History</h2>
        <p className="empty-state">No confirmed transactions yet.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="panel transaction-history"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <h2 className="panel-title">Transaction History</h2>
      <p className="panel-subtitle">{transactions.length} confirmed across the chain</p>

      <div className="tx-history-list">
        {transactions.map((tx, index) => (
          <motion.div
            key={tx.key}
            className="tx-history-item"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.25, delay: index * 0.03 }}
          >
            <div className="tx-history-meta">
              <span className="tx-block-badge">Block {tx.blockIndex}</span>
              <span className="tx-amount">{formatAmount(tx.amount)}</span>
            </div>
            <div className="tx-history-flow">
              <span className="mono" title={tx.fromAddress}>
                {truncateHash(formatAddress(tx.fromAddress), 8)}
              </span>
              <span className="tx-arrow">→</span>
              <span className="mono" title={tx.toAddress}>
                {truncateHash(tx.toAddress, 8)}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default TransactionHistory;
