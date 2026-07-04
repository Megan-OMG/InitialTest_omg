import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchDashboard } from '../api/blockchain.api';
import { POLL_INTERVAL_MS } from '../constants';

const OFFLINE_THRESHOLD = 2;

const useBlockchain = (pollInterval = POLL_INTERVAL_MS) => {
  const [chain, setChain] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const intervalRef = useRef(null);
  const failureCountRef = useRef(0);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const refresh = useCallback(async () => {
    try {
      const { chainData, statsData } = await fetchDashboard();
      setChain(chainData);
      setStats(statsData);
      setError(null);
      failureCountRef.current = 0;
      setConnectionStatus('connected');
    } catch (err) {
      failureCountRef.current += 1;
      const message = err.message || 'Failed to connect to the blockchain API.';

      if (failureCountRef.current >= OFFLINE_THRESHOLD) {
        setConnectionStatus('offline');
        setError(message);
      } else {
        setConnectionStatus('reconnecting');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  const startPolling = useCallback(() => {
    stopPolling();
    intervalRef.current = setInterval(() => {
      refreshRef.current();
    }, pollInterval);
  }, [pollInterval, stopPolling]);

  const pausePolling = useCallback(() => {
    stopPolling();
  }, [stopPolling]);

  const resumePolling = useCallback(async () => {
    await refreshRef.current();
    startPolling();
  }, [startPolling]);

  useEffect(() => {
    refresh();
    startPolling();
    return stopPolling;
  }, [refresh, startPolling, stopPolling]);

  return {
    chain,
    stats,
    loading,
    error,
    connectionStatus,
    refresh,
    pausePolling,
    resumePolling,
  };
};

export default useBlockchain;
