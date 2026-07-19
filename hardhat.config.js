require('@nomicfoundation/hardhat-ethers');
require('@nomicfoundation/hardhat-chai-matchers');
require('dotenv').config();

// Get Network parameters from env
const RPC_URL = process.env.RPC_URL || '';
const CHAIN_ID = process.env.CHAIN_ID ? parseInt(process.env.CHAIN_ID, 10) : undefined;
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY || '';

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: {
    version: '0.8.20',
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  paths: {
    sources: './contracts',
    tests: './contract-test',
    cache: './cache',
    artifacts: './artifacts',
  },
  networks: {
    hardhat: {},
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
    custom: {
      url: RPC_URL,
      chainId: CHAIN_ID,
      accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : [],
    },
  },
};
