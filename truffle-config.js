require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  // Configure your networks
  networks: {
    // Development network - Ganache
    development: {
      host: "127.0.0.1",
      port: 7545,  // Changed to match Ganache GUI port
      network_id: "5777",  // Changed to match Ganache network ID
      from: "0xa5614113F16a32A1d7d2699c01108feBcf9642A6", // Your Ganache account
      gas: 6721975,
      gasPrice: 20000000000  // 20 gwei
    },

    // Local network - For testing with Ganache GUI
    local: {
      provider: () => new HDWalletProvider(
        "7fd75bccfb23562f9096678a4eeb1c227dd6c87143d986247bdede084027a2e4", // Your private key
        "http://127.0.0.1:7545"
      ),
      network_id: "5777",
      gas: 6721975,
      gasPrice: 20000000000
    },

    // Test network configuration (optional)
    sepolia: {
      provider: () => new HDWalletProvider(
        process.env.MNEMONIC,
        process.env.ETH_NODE_URL || "http://127.0.0.1:7545"
      ),
      network_id: 11155111,
      gas: 5500000,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }
  },

  // Configure your compilers
  compilers: {
    solc: {
      version: "0.8.19",
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        },
        evmVersion: "paris"
      }
    }
  },

  // Contracts directory
  contracts_directory: './contracts',
  contracts_build_directory: './build/contracts',
  migrations_directory: './migrations',

  // Configure plugins
  plugins: [
    'truffle-contract-size'
  ],

  // Mocha testing configuration
  mocha: {
    timeout: 100000,
    useColors: true
  },

  // Configure the build pipeline
  build: {
    // Copy build contracts to the frontend
    contracts_build_directory: "./frontend/src/contracts"
  },

  // Dashboard configuration (optional)
  dashboard: {
    port: 24012
  }
};