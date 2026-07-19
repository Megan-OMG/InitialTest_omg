const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');

const { Blockchain, Transaction } = require('../models/blockchain');
const persistenceService = require('../services/persistence.service');

const originalStatePath = process.env.BLOCKCHAIN_STATE_PATH;

// Build a properly signed transaction
const signedTransaction = (toAddress, amount) => {
  const { privateKey } = crypto.generateKeyPairSync('ec', { namedCurve: 'secp256k1' });
  const tx = new Transaction('placeholder', toAddress, amount);
  tx.signTransaction(privateKey); // sets fromAddress to the derived public key + signature
  return tx;
};

test.beforeEach(async () => {
  process.env.BLOCKCHAIN_STATE_PATH = `${process.cwd()}/tests/.tmp-blockchain.json`;
  await persistenceService.clear();
});

test.afterEach(async () => {
  if (originalStatePath === undefined) {
    delete process.env.BLOCKCHAIN_STATE_PATH;
  } else {
    process.env.BLOCKCHAIN_STATE_PATH = originalStatePath;
  }
  await persistenceService.clear();
});

test('rejects unsigned transactions', () => {
  const chain = new Blockchain(1, 10);
  const tx = new Transaction('wallet-a', 'wallet-b', 25);

  assert.throws(() => chain.addTransaction(tx), /unsigned or invalid/i);
});

test('assigns a stable hash to added transactions', () => {
  const chain = new Blockchain(1, 10);
  const tx = signedTransaction('wallet-b', 25);

  chain.addTransaction(tx);

  assert.match(tx.hash, /^[0-9a-f]{64}$/);
  assert.equal(tx.hash, tx.computeHash());
});

test('persists and restores blockchain state', async () => {
  const chain = new Blockchain(1, 10);
  const tx = signedTransaction('wallet-b', 25);
  chain.addTransaction(tx);

  await persistenceService.save(chain);
  const restored = await persistenceService.load();

  assert.ok(restored);
  assert.equal(restored.chain.length, 1);
  assert.equal(restored.pendingTransactions.length, 1);
  assert.equal(restored.pendingTransactions[0].amount, 25);
  assert.equal(restored.pendingTransactions[0].hash, tx.hash);
});

test('explorer search finds blocks, transactions, and addresses', () => {
  const chain = new Blockchain(1, 10);
  chain.minePendingTransactions('miner1'); // block #1 with a reward transaction
  const block = chain.chain[1];
  const rewardTx = block.transactions[0];

  const foundBlock = chain.findBlockByHash(block.hash);
  assert.equal(foundBlock.height, 1);

  const foundTx = chain.findTransactionByHash(rewardTx.hash);
  assert.equal(foundTx.status, 'confirmed');
  assert.equal(foundTx.blockHeight, 1);

  const summary = chain.getAddressSummary('miner1');
  assert.equal(summary.balance, 10);
  assert.equal(summary.transactionCount, 1);

  assert.equal(chain.findBlockByHash('does-not-exist'), null);
  assert.equal(chain.findTransactionByHash('does-not-exist'), null);
});
