const models = require("../models");
const persistenceService = require("../services/persistence.service");
const { sendSuccess } = require("../utils/response");
const logger = require("../utils/logger");

const mineBlock = async (req, res, next) => {
  try {
    const miningRewardAddress = req.body.miningRewardAddress || "miner1";

    logger.info(`Mining block for reward address: ${miningRewardAddress}`);
    await models.blockchain.minePendingTransactions(miningRewardAddress);
    await persistenceService.save(models.blockchain);
    logger.info(
      `Block mined successfully: ${models.blockchain.getLatestBlock().hash}`,
    );

    sendSuccess(res, {
      message: "Block mined successfully",
      latestBlock: models.blockchain.getLatestBlock(),
      chainLength: models.blockchain.chain.length,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { mineBlock };
