import { secp256k1 } from '@noble/curves/secp256k1.js';
import { sha256 } from '@noble/hashes/sha2.js';

const hexToBytes = (hex) => Uint8Array.from(hex.match(/.{1,2}/g).map((b) => parseInt(b, 16)));
const bytesToHex = (bytes) => Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

/**
 * Transaction hash: sha256 (hex) of (fromAddress + toAddress + amount + timestamp)
 * @returns {string} hex string
 */
export const hashTransaction = ({ fromAddress, toAddress, amount, timestamp }) => {
  const payload = `${fromAddress}${toAddress}${amount}${timestamp}`;
  return bytesToHex(sha256(new TextEncoder().encode(payload)));
};

/**
 * Sign a transaction locally with the wallet's private key.
 * The private key never leaves the browser, only the signature is returned.
 * @returns {{ signature: string, timestamp: number }}
 */
export const signTransaction = ({ privateKeyHex, fromAddress, toAddress, amount, timestamp }) => {
  if (!privateKeyHex) {
    throw new Error('This wallet has no signing key. Please re-create the wallet.');
  }

  const hashHex = hashTransaction({ fromAddress, toAddress, amount, timestamp });
  const message = new TextEncoder().encode(hashHex);
  const signature = secp256k1.sign(message, hexToBytes(privateKeyHex));
  const der = secp256k1.Signature.fromBytes(signature, 'compact').toBytes('der');
  return bytesToHex(der);
};
