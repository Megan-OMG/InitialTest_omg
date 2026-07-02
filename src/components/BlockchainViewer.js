import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./BlockchainViewer.css";

const BlockCard = ({ block, index, isGenesis, isLatest }) => {
  const [expanded, setExpanded] = React.useState(isLatest);

  return (
    <div className="block-card">
      <div
        className="block-header"
        onClick={() => setExpanded(!expanded)}
        style={{ cursor: "pointer" }}
      >
        <span className="block-number">Block #{index}</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {isGenesis && <span className="genesis-badge">Genesis</span>}
          <span className="expand-icon">{expanded ? "−" : "+"}</span>
        </div>
      </div>

      {expanded && (
        <div className="block-content">
          <div className="block-field">
            <span className="field-label">Hash</span>
            <span className="field-value hash">{block.hash}</span>
          </div>
          <div className="block-field">
            <span className="field-label">Previous hash</span>
            <span className="field-value hash">
              {block.previousHash || "N/A"}
            </span>
          </div>
          <div className="block-meta-row">
            <div>
              <span className="field-label">Timestamp</span>
              <div className="field-value-inline">
                {new Date(block.timestamp).toLocaleString()}
              </div>
            </div>
            <div>
              <span className="field-label">Nonce</span>
              <div className="field-value-inline">{block.nonce}</div>
            </div>
          </div>

          {block.transactions && block.transactions.length > 0 && (
            <div className="transactions-list">
              <div className="transactions-header">
                {block.transactions.length} transaction
                {block.transactions.length !== 1 ? "s" : ""}
              </div>
              {block.transactions.map((tx, txIndex) => (
                <div key={txIndex} className="transaction-item">
                  <span className="tx-address">
                    {tx.fromAddress
                      ? `${tx.fromAddress.slice(0, 10)}…`
                      : "Mining reward"}
                  </span>
                  <span className="tx-arrow">→</span>
                  <span className="tx-address">
                    {tx.toAddress.slice(0, 10)}…
                  </span>
                  <span className="tx-amount">{tx.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const BlockchainViewer = ({ blockchain }) => {
  if (!blockchain || !blockchain.chain) {
    return (
      <div className="blockchain-viewer card">
        <p className="panel-subtitle">Loading blockchain data…</p>
      </div>
    );
  }

  return (
    <div className="blockchain-viewer card">
      <h2 className="panel-title">Blockchain</h2>
      <p className="panel-subtitle">
        {blockchain.chain.length} block
        {blockchain.chain.length !== 1 ? "s" : ""}
      </p>

      <div className="blocks-container">
        <AnimatePresence initial={false}>
          {blockchain.chain.map((block, index) => (
            <motion.div
              key={block.hash}
              className="block-row"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="block-connector">
                <span
                  className={`block-dot ${index === blockchain.chain.length - 1 ? "latest" : ""}`}
                />
                {index < blockchain.chain.length - 1 && (
                  <span className="block-line" />
                )}
              </div>

              <BlockCard
                block={block}
                index={index}
                isGenesis={index === 0}
                isLatest={index === blockchain.chain.length - 1}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BlockchainViewer;
