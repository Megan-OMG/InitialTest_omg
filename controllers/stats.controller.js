const models = require("../models");
const { sendSuccess } = require("../utils/response");

const getStats = (req, res) => {
  const allTransactions = models.blockchain.getAllTransactions();

  sendSuccess(res, {
    chainLength: models.blockchain.chain.length,
    pendingTransactions: models.blockchain.pendingTransactions.length,
    totalTransactions: allTransactions.length,
    difficulty: models.blockchain.difficulty,
    miningReward: models.blockchain.miningReward,
    isValid: models.blockchain.isChainValid(),
    latestBlockHash: models.blockchain.getLatestBlock().hash,
  });
};

module.exports = { getStats };
