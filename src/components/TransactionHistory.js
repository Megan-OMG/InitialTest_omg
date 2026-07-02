// src/components/TransactionHistory.js
import React, { useEffect, useState } from "react";
import { fetchAllTransactions } from "../api/blockchain.api";
import "./TransactionHistory.css";

// TransactionHistory.js — accept transactions as a prop instead of self-fetching
const TransactionHistory = ({ transactions, loading, error }) => {
  return (
    <div className="transaction-history card">
      <h2 className="panel-title">Transaction history</h2>
      <p className="panel-subtitle">
        Every transaction ever confirmed on this chain.
      </p>

      {loading && <p className="panel-subtitle">Loading…</p>}
      {error && <div className="inline-message error">{error}</div>}

      {!loading && !error && transactions.length === 0 && (
        <p className="panel-subtitle">
          No transactions yet. Mine a block to get started.
        </p>
      )}

      {!loading && transactions.length > 0 && (
        <div className="history-list">
          {transactions
            .slice()
            .reverse()
            .map((tx, i) => (
              <div key={i} className="history-item">
                <div className="history-addresses">
                  <span className="tx-address">
                    {tx.fromAddress
                      ? `${tx.fromAddress.slice(0, 14)}…`
                      : "Mining reward"}
                  </span>
                  <span className="tx-arrow">→</span>
                  <span className="tx-address">
                    {tx.toAddress.slice(0, 14)}…
                  </span>
                </div>
                <span className="history-amount">{tx.amount}</span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
