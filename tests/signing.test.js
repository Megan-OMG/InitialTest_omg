const crypto = require('crypto');
const test = require('node:test');
const assert = require('node:assert/strict');
const { Transaction } = require('../models/blockchain');

test('signed transaction validates with sha256 algorithm', () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'secp256k1',
  });

  const publicKeyHex = publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
  const tx = new Transaction(publicKeyHex, 'recipient-address', 50);
  tx.signTransaction(privateKey);

  assert.ok(tx.signature.length > 0);
  assert.equal(tx.isValid(), true);
});

test('unsigned transaction fails validation', () => {
  const tx = new Transaction('sender', 'recipient', 25);
  assert.equal(tx.isValid(), false);
});
