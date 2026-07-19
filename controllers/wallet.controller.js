const crypto = require('crypto');
const { sendSuccess, sendError } = require('../utils/response');
const { isValidAddress, sanitizeAddress } = require('../utils/validator');
const { blockchain } = require('../models');

// Generate a new wallet with a public/private key pair and return the public key and private key in PEM format
const generateWallet = (req, res) => {
  try {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
      namedCurve: 'secp256k1',
    });

    const publicKeyHex = publicKey.export({ type: 'spki', format: 'der' }).toString('hex');
    const privateKeyPem = privateKey.export({ type: 'pkcs8', format: 'pem' });
    const privateKeyHex = Buffer.from(privateKey.export({ format: 'jwk' }).d, 'base64url').toString('hex');

    sendSuccess(res, {
      publicKey: publicKeyHex,
      privateKey: privateKeyPem,
      privateKeyHex,
      balance: blockchain.getBalanceOfAddress(publicKeyHex),
    });
  } catch (error) {
    sendError(res, error.message || 'Failed to create wallet', 500);
  }
};

// Get the balance of a wallet by its public key
const getWalletBalance = (req, res) => {
  const address = sanitizeAddress(req.params.address);

  if (!isValidAddress(address)) {
    return sendError(res, 'Invalid wallet address', 400);
  }

  sendSuccess(res, { address, balance: blockchain.getBalanceOfAddress(address) });
};

module.exports = { generateWallet, getWalletBalance };
