import React, { useState, useCallback } from 'react';
import './App.css';

import BlockchainViewer from './components/BlockchainViewer';
import TransactionForm from './components/TransactionForm';
import TransactionHistory from './components/TransactionHistory';
import WalletPanel from './components/WalletPanel';
import BalanceLookup from './components/BalanceLookup';
import StatsPanel from './components/StatsPanel';
import Header from './components/Header';

import useBlockchain from './hooks/useBlockchain';
import { mineBlock } from './api/blockchain.api';

function App() {
  const {
    chain,
    stats,
    loading,
    error,
    connectionStatus,
    refresh,
    pausePolling,
    resumePolling,
  } = useBlockchain();

  const [activeWallet, setActiveWallet] = useState(null);
  const [mining, setMining] = useState(false);
  const [miningAnimating, setMiningAnimating] = useState(false);

  const handleWalletCreated = useCallback((wallet) => {
    setActiveWallet(wallet);
  }, []);

  const handleMine = async () => {
    setMining(true);
    setMiningAnimating(true);
    pausePolling();

    try {
      await mineBlock(activeWallet?.publicKey);
      await refresh();
    } catch (err) {
      console.error('Mining failed:', err.message);
    } finally {
      setMining(false);
      setTimeout(() => setMiningAnimating(false), 800);
      resumePolling();
    }
  };

  if (loading && !chain) {
    return (
      <div className="app-loading">
        <div className="spinner" />
        <p>Loading blockchain…</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Header connectionStatus={connectionStatus} />

      <div className="app-container">
        {connectionStatus === 'reconnecting' && (
          <div className="status-banner reconnecting">
            Reconnecting to backend…
          </div>
        )}

        {connectionStatus === 'offline' && (
          <div className="status-banner offline">
            <span>{error || 'Backend unavailable'}</span>
            <button type="button" className="btn btn-ghost btn-sm" onClick={refresh}>
              Retry
            </button>
          </div>
        )}

        <div className="main-content">
          <div className="left-panel">
            <StatsPanel stats={stats} onMine={handleMine} mining={mining} />
            <WalletPanel activeWallet={activeWallet} onWalletCreated={handleWalletCreated} />
            <BalanceLookup />
            <TransactionForm
              activeWallet={activeWallet}
              onTransactionAdded={refresh}
            />
          </div>

          <div className="right-panel">
            <TransactionHistory chain={chain} />
            <BlockchainViewer blockchain={chain} miningAnimating={miningAnimating} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
