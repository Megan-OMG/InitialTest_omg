const models = require('../models');
const persistenceService = require('../services/persistence.service');
const { sendSuccess } = require('../utils/response');

const getChain = (req, res) => {
  const { blockchain } = models;
  sendSuccess(res, {
    chain: blockchain.chain,
    length: blockchain.chain.length,
  });
};

const validateChain = (req, res) => {
  const { blockchain } = models;
  sendSuccess(res, { isValid: blockchain.isChainValid() });
};

module.exports = { getChain, validateChain };
