import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { addTransaction } from "../api/blockchain.api";
import { signTransaction } from "../utils/signing";
import "./TransactionForm.css";

const TransactionForm = ({ onTransactionAdded, activeWallet }) => {
  const [formData, setFormData] = useState({
    fromAddress: "",
    toAddress: "",
    amount: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (activeWallet?.publicKey) {
      setFormData((prev) => ({ ...prev, fromAddress: activeWallet.publicKey }));
    }
  }, [activeWallet]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setStatus(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      const timestamp = Date.now();
      let signature = "";

      // Only sign if this is the active wallet sending from itself
      if (activeWallet && formData.fromAddress === activeWallet.publicKey) {
        signature = signTransaction(
          activeWallet.privateKey,
          formData.fromAddress,
          formData.toAddress,
          parseFloat(formData.amount),
          timestamp,
        );
      } else {
        throw new Error(
          "You can only send from a wallet you created in this session.",
        );
      }

      await addTransaction(
        formData.fromAddress,
        formData.toAddress,
        parseFloat(formData.amount),
        timestamp,
        signature,
      );
      setStatus({
        type: "success",
        text: "Transaction signed and added to the pending pool.",
      });
      setFormData((prev) => ({ ...prev, toAddress: "", amount: "" }));
      onTransactionAdded();
    } catch (err) {
      setStatus({
        type: "error",
        text: err.message || "Failed to add transaction",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transaction-form card">
      <h2 className="panel-title">Create transaction</h2>
      <p className="panel-subtitle">
        Signed with your wallet's private key before sending.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fromAddress">From address</label>
          <input
            type="text"
            id="fromAddress"
            name="fromAddress"
            value={formData.fromAddress}
            onChange={handleChange}
            placeholder="Create a wallet first"
            required
            readOnly={!!activeWallet}
          />
        </div>

        <div className="form-group">
          <label htmlFor="toAddress">To address</label>
          <input
            type="text"
            id="toAddress"
            name="toAddress"
            value={formData.toAddress}
            onChange={handleChange}
            placeholder="Recipient's public key"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            required
          />
        </div>

        {status && (
          <div className={`inline-message ${status.type}`}>{status.text}</div>
        )}

        <motion.button
          type="submit"
          className="btn-primary"
          disabled={loading || !activeWallet}
          whileTap={{ scale: 0.98 }}
          style={{ width: "100%" }}
        >
          {loading ? "Signing & sending…" : "Sign & send transaction"}
        </motion.button>
      </form>
    </div>
  );
};

export default TransactionForm;
