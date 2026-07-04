import { KEYUTIL, KJUR } from 'jsrsasign';

/**
 * Matches backend Transaction.calculateHash() — SHA256 of concatenated fields.
 */
export const calculateTransactionHash = (fromAddress, toAddress, amount, timestamp) => {
  const message = `${fromAddress}${toAddress}${amount}${timestamp}`;
  return KJUR.crypto.Util.sha256(message);
};

/**
 * Signs a transaction using the same double-hash scheme as Node crypto.sign('sha256', ...):
 * SHA256withECDSA over the UTF-8 bytes of the hex hash string.
 */
export const signTransaction = (fromAddress, toAddress, amount, timestamp, privateKeyPem) => {
  const hashHex = calculateTransactionHash(fromAddress, toAddress, amount, timestamp);
  const key = KEYUTIL.getKey(privateKeyPem);
  const sig = new KJUR.crypto.Signature({ alg: 'SHA256withECDSA' });
  sig.init(key);
  sig.updateString(hashHex);
  return sig.sign();
};

export const copyToClipboard = async (text) => {
  await navigator.clipboard.writeText(text);
};
