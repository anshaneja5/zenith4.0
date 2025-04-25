require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  networks: {
    sepolia: {
      url: process.env.BLOCKCHAIN_PROVIDER_URL,
      accounts: [process.env.ETHEREUM_PRIVATE_KEY]
    }
  },
  solidity: "0.8.28"
};
