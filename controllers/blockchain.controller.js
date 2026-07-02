const models = require("../models");
const { sendSuccess } = require("../utils/response");

const getChain = (req, res) => {
  sendSuccess(res, {
    chain: models.blockchain.chain,
    length: models.blockchain.chain.length,
  });
};

const validateChain = (req, res) => {
  sendSuccess(res, { isValid: models.blockchain.isChainValid() });
};

module.exports = { getChain, validateChain };
