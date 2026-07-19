import { secp256k1 } from '@noble/curves/secp256k1.js';
import {
  generateMnemonic as bip39Generate,
  mnemonicToSeedSync,
  validateMnemonic as bip39Validate,
} from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english.js';
import { HDKey } from '@scure/bip32';

const SPKI_PREFIX = '3056301006072a8648ce3d020106052b8104000a034200';

// Fixed derivation path
const derivationPath = (index) => `m/44'/60'/0'/0/${index}`;

const toHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
const fromHex = (hex) => Uint8Array.from(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));

const addressFromPrivateKey = (privateKeyBytes) => {
  const point = secp256k1.getPublicKey(privateKeyBytes, false);
  return SPKI_PREFIX + toHex(point);
};

export const generateMnemonic = () => bip39Generate(wordlist, 128); // 12 words

export const isValidMnemonic = (mnemonic) =>
  bip39Validate((mnemonic || '').trim().replace(/\s+/g, ' '), wordlist);

export const isValidPrivateKeyHex = (hex) => {
  if (typeof hex !== 'string' || !/^[0-9a-fA-F]{64}$/.test(hex.trim())) return false;
  try {
    secp256k1.getPublicKey(fromHex(hex.trim()), false);
    return true;
  } catch {
    return false;
  }
};

/**
 * Derive account index from a mnemonic
 * @returns {{ index: number, publicKey: string, privateKeyHex: string }}
 */
export const deriveAccount = (mnemonic, index) => {
  const seed = mnemonicToSeedSync(mnemonic.trim().replace(/\s+/g, ' '));
  const node = HDKey.fromMasterSeed(seed).derive(derivationPath(index));
  const privateKeyHex = toHex(node.privateKey);
  return { index, publicKey: addressFromPrivateKey(node.privateKey), privateKeyHex };
};

/**
 * Build a single standalone account from a raw private key
 * @returns {{ index: number, publicKey: string, privateKeyHex: string }}
 */
export const accountFromPrivateKey = (privateKeyHex) => {
  const clean = privateKeyHex.trim();
  return { index: 0, publicKey: addressFromPrivateKey(fromHex(clean)), privateKeyHex: clean };
};
