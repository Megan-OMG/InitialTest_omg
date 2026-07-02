import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createWallet, fetchBalance } from "../api/blockchain.api";
import "./WalletPanel.css";

const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button type="button" className="copy-btn" onClick={handleCopy}>
      {copied ? "Copied" : "Copy"}
    </button>
  );
};

const WalletPanel = ({ onWalletCreated }) => {
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [revealed, setRevealed] = useState(false);

  const handleCreateWallet = async () => {
    setLoading(true);
    setError("");
    setRevealed(false);
    try {
      const walletData = await createWallet();
      setWallet(walletData);
      const balanceResponse = await fetchBalance(walletData.publicKey);
      setBalance(balanceResponse.balance);
      onWalletCreated?.(walletData);
    } catch (err) {
      setError(err.message || "Failed to create wallet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-panel card">
      <h2 className="panel-title">Wallet Studio</h2>
      <p className="panel-subtitle">
        Generate a key pair and inspect its balance.
      </p>

      <motion.button
        type="button"
        className="btn-primary"
        onClick={handleCreateWallet}
        disabled={loading}
        whileTap={{ scale: 0.98 }}
        style={{ width: "100%" }}
      >
        {loading ? "Generating…" : "Create wallet"}
      </motion.button>

      {error && <div className="inline-message error">{error}</div>}

      <AnimatePresence>
        {wallet && (
          <motion.div
            className="wallet-details"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="field-row">
              <label>Public key</label>
              <CopyButton text={wallet.publicKey} />
            </div>
            <div className="field-value hash">{wallet.publicKey}</div>

            <div className="field-row">
              <label>Private key</label>
              {revealed ? (
                <CopyButton text={wallet.privateKey} />
              ) : (
                <button
                  type="button"
                  className="reveal-btn"
                  onClick={() => setRevealed(true)}
                >
                  Reveal
                </button>
              )}
            </div>
            {revealed ? (
              <div className="field-value hash">{wallet.privateKey}</div>
            ) : (
              <div className="field-value hash masked">
                •••••••••••••••••••••••••••••••••
              </div>
            )}
            <p className="key-warning">
              Never share your private key. Anyone with it can spend your funds.
            </p>

            <div className="field-row">
              <label>Balance</label>
            </div>
            <div className="field-value balance">{balance}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WalletPanel;
