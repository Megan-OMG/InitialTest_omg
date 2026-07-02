// src/components/BalanceLookup.js
import React, { useState } from "react";
import { fetchBalance } from "../api/blockchain.api";
import "./BalanceLookup.css";

const BalanceLookup = () => {
  const [address, setAddress] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLookup = async (e) => {
    e.preventDefault();
    if (!address.trim()) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetchBalance(address.trim());
      setResult(res);
    } catch (err) {
      setError(err.message || "Could not look up that address");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="balance-lookup card">
      <h2 className="panel-title">Balance lookup</h2>
      <p className="panel-subtitle">
        Check the confirmed balance of any wallet address.
      </p>

      <form onSubmit={handleLookup} className="balance-lookup-form">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Wallet public key"
        />
        <button type="submit" className="btn-secondary" disabled={loading}>
          {loading ? "Looking up…" : "Look up"}
        </button>
      </form>

      {error && <div className="inline-message error">{error}</div>}

      {result && (
        <div className="balance-result">
          <span className="field-label">Balance</span>
          <div className="balance-value">{result.balance}</div>
        </div>
      )}
    </div>
  );
};

export default BalanceLookup;
