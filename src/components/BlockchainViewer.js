import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { truncateHash, formatTimestamp, formatAmount, formatAddress } from '../utils/formatters';
import './BlockchainViewer.css';

const BlockCard = ({ block, index, isLatest, isExpanded, onToggle }) => {
  return (
    <div className={`block-wrapper ${isLatest ? 'latest' : ''}`}>
      <div className="chain-line">
        {isLatest && <span className="chain-pulse" />}
      </div>

      <motion.div
        className="block-card"
        layout
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <button type="button" className="block-header" onClick={onToggle}>
          <div className="block-header-left">
            <span className="block-number">Block {index}</span>
            {index === 0 && <span className="genesis-badge">Genesis</span>}
            {isLatest && <span className="latest-badge">Latest</span>}
          </div>
          <span className="block-toggle">{isExpanded ? '−' : '+'}</span>
        </button>

        <div className="block-summary">
          <span className="mono hash-preview" title={block.hash}>
            {truncateHash(block.hash, 10)}
          </span>
          <span className="tx-count">{block.transactions?.length || 0} tx</span>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              className="block-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className="block-field">
                <span className="field-label">Hash</span>
                <span className="field-value mono">{block.hash}</span>
              </div>
              <div className="block-field">
                <span className="field-label">Previous Hash</span>
                <span className="field-value mono">{block.previousHash || 'N/A'}</span>
              </div>
              <div className="block-field">
                <span className="field-label">Timestamp</span>
                <span className="field-value">{formatTimestamp(block.timestamp)}</span>
              </div>
              <div className="block-field">
                <span className="field-label">Nonce</span>
                <span className="field-value">{block.nonce}</span>
              </div>

              {block.transactions?.length > 0 && (
                <div className="transactions-list">
                  {block.transactions.map((tx, txIndex) => (
                    <div key={txIndex} className="transaction-item">
                      <div className="tx-from">
                        <span className="tx-label">From</span>
                        <span className="tx-address mono">{formatAddress(tx.fromAddress)}</span>
                      </div>
                      <span className="tx-arrow">→</span>
                      <div className="tx-to">
                        <span className="tx-label">To</span>
                        <span className="tx-address mono">{tx.toAddress}</span>
                      </div>
                      <span className="tx-amount">{formatAmount(tx.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

const BlockchainViewer = ({ blockchain, miningAnimating }) => {
  const [expandedBlocks, setExpandedBlocks] = useState({});

  if (!blockchain || !blockchain.chain) {
    return (
      <div className="blockchain-viewer panel">
        <p className="empty-state">Loading blockchain data…</p>
      </div>
    );
  }

  const chain = blockchain.chain;
  const latestIndex = chain.length - 1;

  const toggleBlock = (index) => {
    setExpandedBlocks((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <motion.div
      className="blockchain-viewer panel"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="viewer-header">
        <h2 className="panel-title">Blockchain</h2>
        <span className="block-count">{chain.length} blocks</span>
      </div>

      <div className={`blocks-container ${miningAnimating ? 'mining' : ''}`}>
        {[...chain].reverse().map((block, reverseIndex) => {
          const index = chain.length - 1 - reverseIndex;
          return (
            <BlockCard
              key={index}
              block={block}
              index={index}
              isLatest={index === latestIndex}
              isExpanded={expandedBlocks[index] ?? index === latestIndex}
              onToggle={() => toggleBlock(index)}
            />
          );
        })}
      </div>
    </motion.div>
  );
};

export default BlockchainViewer;
