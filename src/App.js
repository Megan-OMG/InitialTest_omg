import React, { useState } from "react";
import "./theme.css";
import "./App.css";

import ErrorBoundary from "./components/ErrorBoundary";
import BlockchainViewer from "./components/BlockchainViewer";
import TransactionForm from "./components/TransactionForm";
import WalletPanel from "./components/WalletPanel";
import StatsPanel from "./components/StatsPanel";
import Header from "./components/Header";
import BalanceLookup from "./components/BalanceLookup";
import TransactionHistory from "./components/TransactionHistory";

import useBlockchain from "./hooks/useBlockchain";
import { mineBlock } from "./api/blockchain.api";

function App() {
  const [activeWallet, setActiveWallet] = useState(null);

  const {
    chain,
    stats,
    loading,
    error,
    refresh,
    isOffline,
    pausePolling,
    resumePolling,
  } = useBlockchain();

  const handleMine = async () => {
    pausePolling();
    try {
      await mineBlock();
    } catch (err) {
      console.error("Mining failed:", err.message);
    } finally {
      await resumePolling();
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading blockchain…</p>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="App">
        <Header />
        <div className="app-container">
          {isOffline && (
            <div className="error-banner offline">
              <div>
                <strong>Can't reach the server.</strong>
                <p>
                  The blockchain API isn't responding. Your last known data is
                  shown below.
                </p>
              </div>
              <button className="btn-secondary" onClick={refresh}>
                Retry now
              </button>
            </div>
          )}
          {error && !isOffline && (
            <div className="error-banner transient">
              <p>Connection hiccup — retrying automatically…</p>
            </div>
          )}

          <div className="main-content">
            <div className="left-panel">
              <StatsPanel stats={stats} onMine={handleMine} />
              <WalletPanel onWalletCreated={setActiveWallet} />
              <TransactionForm
                onTransactionAdded={refresh}
                activeWallet={activeWallet}
              />
              <BalanceLookup />
            </div>

            <div className="right-panel">
              <BlockchainViewer blockchain={chain} />
              <TransactionHistory
                transactions={
                  chain?.chain?.flatMap((b) => b.transactions) || []
                }
                loading={loading}
                error={null}
              />
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
