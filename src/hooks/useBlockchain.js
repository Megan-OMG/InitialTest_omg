import { useState, useEffect, useCallback, useRef } from "react";
import { fetchDashboard } from "../api/blockchain.api";
import { POLL_INTERVAL_MS } from "../constants";

const FAILURES_BEFORE_OFFLINE = 2;

const useBlockchain = (pollInterval = POLL_INTERVAL_MS) => {
  const [chain, setChain] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOffline, setIsOffline] = useState(false);
  const intervalRef = useRef(null);
  const failureCountRef = useRef(0);

  const refresh = useCallback(async () => {
    try {
      const { chainData, statsData } = await fetchDashboard();
      setChain(chainData);
      setStats(statsData);
      setError(null);
      setIsOffline(false);
      failureCountRef.current = 0;
    } catch (err) {
      failureCountRef.current += 1;
      setError(err.message || "Failed to connect to the blockchain API.");
      if (failureCountRef.current >= FAILURES_BEFORE_OFFLINE) {
        setIsOffline(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const startInterval = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(refresh, pollInterval);
  }, [refresh, pollInterval]);

  const pausePolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resumePolling = useCallback(async () => {
    failureCountRef.current = 0;
    setError(null);
    await refresh();
    startInterval();
  }, [refresh, startInterval]);

  useEffect(() => {
    refresh();
    startInterval();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [refresh, startInterval]);

  return {
    chain,
    stats,
    loading,
    error,
    isOffline,
    refresh,
    pausePolling,
    resumePolling,
  };
};

export default useBlockchain;
