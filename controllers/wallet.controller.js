const crypto = require('crypto');
const models = require('../models');
const { sendSuccess, sendError } = require('../utils/response');
const { isValidAddress, sanitizeAddress } = require('../utils/validator');

const generateWallet = (req, res) => {
  try {
    const { blockchain } = models;
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'secp256k1',
    });

    const publicKeyHex = publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
    const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });

    sendSuccess(res, {
      publicKey: publicKeyHex,
      privateKey: privateKeyPem,
      balance: blockchain.getBalanceOfAddress(publicKeyHex),
    });
  } catch (error) {
    sendError(res, error.message || 'Failed to create wallet', 500);
  }
};

const getWalletBalance = (req, res) => {
  const { blockchain } = models;
  const address = sanitizeAddress(req.params.address);

  if (!isValidAddress(address)) {
    return sendError(res, 'Invalid wallet address', 400);
  }

  sendSuccess(res, { address, balance: blockchain.getBalanceOfAddress(address) });
};

module.exports = { generateWallet, getWalletBalance };
