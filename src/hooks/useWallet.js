import { useState, useEffect, useRef, useCallback } from 'react';
import { fetchBalance } from '../api/blockchain.api';
import {
  generateMnemonic,
  isValidMnemonic,
  isValidPrivateKeyHex,
  deriveAccount,
  accountFromPrivateKey,
} from '../utils/hdWallet';
import { encryptSecret, decryptSecret } from '../utils/vault';

const VAULT_KEY = 'wallet.vault';
const ACCOUNTS_KEY = 'wallet.accounts';
const CURRENT_KEY = 'wallet.currentIndex';

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const useWallet = () => {
  const [hasVault, setHasVault] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [wallet, setWallet] = useState(null); // { publicKey, privateKeyHex, index }
  const [allWallets, setAllWallets] = useState([]); // { publicKey, index }[]
  const [balance, setBalance] = useState(null);

  // In-memory secret
  const secretRef = useRef(null); // { type: 'hd'|'privateKey', value: string }

  useEffect(() => {
    const vault = readJSON(VAULT_KEY, null);
    if (vault) {
      setHasVault(true);
      setIsLocked(true); // locked until the user enters their password
    }
  }, []);

  const loadBalance = useCallback(async (publicKey) => {
    if (!publicKey) return;
    try {
      const res = await fetchBalance(publicKey);
      setBalance(res.balance);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
      setBalance(null);
    }
  }, []);

  // Derive an account's full details from the in-memory secret
  const deriveWallet = useCallback((index) => {
    const secret = secretRef.current;
    if (!secret) throw new Error('Wallet is locked');
    return secret.type === 'hd'
      ? deriveAccount(secret.value, index)
      : accountFromPrivateKey(secret.value);
  }, []);

  const activateAccount = useCallback(
    (index, addresses) => {
      const account = deriveWallet(index);
      setWallet({ publicKey: account.publicKey, privateKeyHex: account.privateKeyHex, index });
      setAllWallets(addresses.map((publicKey, i) => ({ publicKey, index: i })));
      localStorage.setItem(CURRENT_KEY, String(index));
      loadBalance(account.publicKey);
    },
    [deriveWallet, loadBalance]
  );

  // Initialize the vault with a new secret then store it in localStorage
  const initVault = useCallback(
    async ({ type, secret, password, firstAccount }) => {
      const encrypted = await encryptSecret(secret, password);
      const addresses = [firstAccount.publicKey];
      localStorage.setItem(VAULT_KEY, JSON.stringify({ type, ...encrypted }));
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(addresses));
      localStorage.setItem(CURRENT_KEY, '0');
      secretRef.current = { type, value: secret };
      setHasVault(true);
      setIsLocked(false);
      activateAccount(0, addresses);
    },
    [activateAccount]
  );

  const createHdWallet = useCallback(
    async (mnemonic, password) => {
      const firstAccount = deriveAccount(mnemonic, 0);
      await initVault({ type: 'hd', secret: mnemonic, password, firstAccount });
    },
    [initVault]
  );

  const importHdWallet = useCallback(
    async (mnemonic, password) => {
      const clean = mnemonic.trim().replace(/\s+/g, ' ');
      if (!isValidMnemonic(clean)) throw new Error('Invalid recovery phrase');
      const firstAccount = deriveAccount(clean, 0);
      await initVault({ type: 'hd', secret: clean, password, firstAccount });
    },
    [initVault]
  );

  const importPrivateKey = useCallback(
    async (privateKeyHex, password) => {
      const clean = privateKeyHex.trim();
      if (!isValidPrivateKeyHex(clean)) throw new Error('Invalid private key (expected 64 hex characters)');
      const firstAccount = accountFromPrivateKey(clean);
      await initVault({ type: 'privateKey', secret: clean, password, firstAccount });
    },
    [initVault]
  );

  const unlock = useCallback(
    async (password) => {
      const vault = readJSON(VAULT_KEY, null);
      if (!vault) throw new Error('No wallet to unlock');
      const secret = await decryptSecret(vault, password);
      secretRef.current = { type: vault.type, value: secret };
      const addresses = readJSON(ACCOUNTS_KEY, []);
      const currentIndex = Number(localStorage.getItem(CURRENT_KEY)) || 0;
      setIsLocked(false);
      activateAccount(currentIndex, addresses);
    },
    [activateAccount]
  );

  const lock = useCallback(() => {
    secretRef.current = null;
    setWallet(null);
    setAllWallets([]);
    setBalance(null);
    setIsLocked(true);
  }, []);

  const isHdWallet = useCallback(() => secretRef.current?.type === 'hd', []);

  const addAccount = useCallback(() => {
    if (secretRef.current?.type !== 'hd') return;
    const addresses = readJSON(ACCOUNTS_KEY, []);
    const nextIndex = addresses.length;
    const account = deriveAccount(secretRef.current.value, nextIndex);
    const updated = [...addresses, account.publicKey];
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(updated));
    activateAccount(nextIndex, updated);
  }, [activateAccount]);

  const switchWallet = useCallback(
    (account) => {
      const addresses = readJSON(ACCOUNTS_KEY, []);
      const index = account.index ?? addresses.indexOf(account.publicKey);
      if (index < 0) return;
      activateAccount(index, addresses);
    },
    [activateAccount]
  );

  const refreshBalance = useCallback(
    async (targetWallet = wallet) => {
      if (targetWallet?.publicKey) await loadBalance(targetWallet.publicKey);
    },
    [wallet, loadBalance]
  );

  const forgetWallet = useCallback(() => {
    localStorage.removeItem(VAULT_KEY);
    localStorage.removeItem(ACCOUNTS_KEY);
    localStorage.removeItem(CURRENT_KEY);
    secretRef.current = null;
    setWallet(null);
    setAllWallets([]);
    setBalance(null);
    setHasVault(false);
    setIsLocked(false);
  }, []);

  return {
    wallet,
    allWallets,
    balance,
    hasVault,
    isLocked,
    generateMnemonic,
    isHdWallet,
    createHdWallet,
    importHdWallet,
    importPrivateKey,
    unlock,
    lock,
    addAccount,
    switchWallet,
    refreshBalance,
    forgetWallet,
  };
};

export default useWallet;
