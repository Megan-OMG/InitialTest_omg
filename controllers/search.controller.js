const { blockchain } = require('../models');
const { sendSuccess, sendError } = require('../utils/response');

// Explorer search endpoint
const search = (req, res) => {
  const query = (req.query.q || '').trim();

  if (!query) {
    return sendError(res, 'Search query is required', 400);
  }

  const block = blockchain.findBlockByHash(query);
  if (block) {
    return sendSuccess(res, { type: 'block', result: block });
  }

  const transaction = blockchain.findTransactionByHash(query);
  if (transaction) {
    return sendSuccess(res, { type: 'transaction', result: transaction });
  }

  // Anything else as an address
  const address = blockchain.getAddressSummary(query);

  // If the address has any transactions or a non-zero balance, return it - otherwise, return a 404 error
  if (address.transactionCount > 0 || address.balance !== 0) {
    return sendSuccess(res, { type: 'address', result: address });
  }
  return sendError(res, 'No matching block, transaction, or address found', 404);
};

module.exports = { search };
