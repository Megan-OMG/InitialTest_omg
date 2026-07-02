const models = require("../models");
const persistenceService = require("../services/persistence.service");
const { sendSuccess, sendCreated, sendError } = require("../utils/response");
const {
  isValidAddress,
  isValidAmount,
  sanitizeAddress,
  sanitizeAmount,
} = require("../utils/validator");

const addTransaction = (req, res, next) => {
  try {
    const { fromAddress, toAddress, amount, signature, timestamp } = req.body;

    if (!isValidAddress(fromAddress) || !isValidAddress(toAddress)) {
      return sendError(res, "Invalid wallet address format", 400);
    }

    if (!isValidAmount(amount)) {
      return sendError(res, "Amount must be a positive number", 400);
    }

    const transaction = new models.Transaction(
      sanitizeAddress(fromAddress),
      sanitizeAddress(toAddress),
      sanitizeAmount(amount),
      timestamp,
    );

    if (signature) {
      transaction.signature = signature;
    }

    try {
      models.blockchain.addTransaction(transaction);
    } catch (modelErr) {
      return sendError(res, modelErr.message, 400);
    }

    persistenceService.save(models.blockchain);

    sendCreated(res, {
      message: "Transaction added to pending pool",
      transaction,
    });
  } catch (err) {
    next(err);
  }
};

const getPendingTransactions = (req, res) => {
  sendSuccess(res, {
    pendingTransactions: models.blockchain.pendingTransactions,
    count: models.blockchain.pendingTransactions.length,
  });
};

const getAllTransactions = (req, res) => {
  const transactions = models.blockchain.getAllTransactions();
  sendSuccess(res, { transactions, count: transactions.length });
};

module.exports = { addTransaction, getPendingTransactions, getAllTransactions };
