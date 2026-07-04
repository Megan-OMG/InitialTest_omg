const crypto = require('crypto');
const { Transaction } = require('../models/blockchain');

// Simulate frontend signing with same hash scheme
function frontendSign(fromAddress, toAddress, amount, timestamp, privateKeyPem) {
  const { KEYUTIL, KJUR } = require('jsrsasign');
  const message = `${fromAddress}${toAddress}${amount}${timestamp}`;
  const hashHex = KJUR.crypto.Util.sha256(message);
  const key = KEYUTIL.getKey(privateKeyPem);
  const sig = new KJUR.crypto.Signature({ alg: 'SHA256withECDSA' });
  sig.init(key);
  sig.updateString(hashHex);
  return sig.sign();
}

const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'secp256k1',
});

const publicKeyHex = publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });

const toAddress = 'recipient-key';
const amount = 42;
const timestamp = Date.now();

const signature = frontendSign(publicKeyHex, toAddress, amount, timestamp, privateKeyPem);

const tx = new Transaction(publicKeyHex, toAddress, amount);
tx.timestamp = timestamp;
tx.signature = signature;

if (!tx.isValid()) {
  console.error('FAIL: frontend signature did not verify on backend');
  process.exit(1);
}

console.log('OK: frontend signature verifies on backend');
