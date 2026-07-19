import React from 'react';
import './App.css';

import BlockchainViewer from './components/BlockchainViewer';
import TransactionForm from './components/TransactionForm';
import WalletPanel from './components/WalletPanel';
import StatsPanel from './components/StatsPanel';
import Header from './components/Header';
import Explorer from './components/Explorer';

import useBlockchain from './hooks/useBlockchain';
import { mineBlock } from './api/blockchain.api';
import { useWalletContext } from './context/WalletContext';

function App() {
  const { chain, stats, loading, error, refresh } = useBlockchain();
  const { wallet, refreshBalance } = useWalletContext();

  const handleMine = async () => {
    if (!wallet) return;
    try {
      console.log("Mining block...");
      await mineBlock(wallet.publicKey);
      console.log("Block mined successfully...refreshing state");
      await refresh();
      await refreshBalance();
    } catch (err) {
      console.error('Mining failed:', err.message);
    }
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="spinner"></div>
        <p>Loading Blockchain...</p>
      </div>
    );
  }

  return (
    <div className="App">
      <Header />
      <div className="app-container">
        {error && (
          <div className="error-banner">
            <p>{error}</p>
          </div>
        )}

        <div className="main-content">
          <div className="left-panel">
            <StatsPanel stats={stats} onMine={handleMine} canMine={!!wallet} />
            <WalletPanel />
            <TransactionForm onTransactionAdded={refresh} wallet={wallet} />
          </div>

          <div className="right-panel">
            <BlockchainViewer blockchain={chain} />
            <Explorer />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
