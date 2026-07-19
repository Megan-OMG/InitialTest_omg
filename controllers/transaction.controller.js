const { blockchain, Transaction } = require('../models');
const persistenceService = require('../services/persistence.service');
const { sendSuccess, sendCreated, sendError } = require('../utils/response');
const { isValidAddress, isValidAmount, sanitizeAddress, sanitizeAmount } = require('../utils/validator');

const addTransaction = (req, res, next) => {
  try {
    const { fromAddress, toAddress, amount, signature, timestamp } = req.body;

    if (!isValidAddress(fromAddress) || !isValidAddress(toAddress)) {
      return sendError(res, 'Invalid wallet address format', 400);
    }

    if (!isValidAmount(amount)) {
      return sendError(res, 'Amount must be a positive number', 400);
    }

    const sanitizedFrom = sanitizeAddress(fromAddress);
    const sanitizedAmount = sanitizeAmount(amount);

    const transaction = new Transaction(
      sanitizedFrom,
      sanitizeAddress(toAddress),
      sanitizedAmount
    );

    // Use the client's timestamp so the signed hash matches what we verify
    if (Number.isFinite(Number(timestamp))) {
      transaction.timestamp = Number(timestamp);
    }

    if (signature) {
      transaction.signature = signature;
    }

    if (!transaction.isValid()) {
      return sendError(res, 'Invalid transaction signature', 400);
    }

    // available balance should be confirmed balance minus already-pending outgoing
    const confirmedBalance = blockchain.getBalanceOfAddress(sanitizedFrom);
    const pendingOutgoing = blockchain.pendingTransactions
      .filter((tx) => tx.fromAddress === sanitizedFrom)
      .reduce((sum, tx) => sum + tx.amount, 0);
    const available = confirmedBalance - pendingOutgoing;

    if (sanitizedAmount > available) {
      return sendError(res, `Insufficient balance. Available: ${available}`, 400);
    }

    blockchain.addTransaction(transaction);
    persistenceService.save(blockchain);

    sendCreated(res, {
      message: 'Transaction added to pending pool',
      transaction,
      transactionHash: transaction.hash,
    });
  } catch (err) {
    next(err);
  }
};

const getPendingTransactions = (req, res) => {
  sendSuccess(res, {
    pendingTransactions: blockchain.pendingTransactions,
    count: blockchain.pendingTransactions.length,
  });
};

const getAllTransactions = (req, res) => {
  const transactions = blockchain.getAllTransactions();
  sendSuccess(res, { transactions, count: transactions.length });
};

module.exports = { addTransaction, getPendingTransactions, getAllTransactions };
