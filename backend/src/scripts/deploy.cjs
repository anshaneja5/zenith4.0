// Import the Hardhat module
const hre = require("hardhat");

async function main() {
  // Extract ethers from the Hardhat Runtime Environment
  const { ethers } = hre;

  // Get the deployer's signer
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with account:", deployer.address);

  // Get the deployer's balance
  const balance = await deployer.provider.getBalance(deployer.address);
  console.log("Account balance (wei):", balance.toString());
  console.log("Account balance (ETH):", ethers.formatEther(balance));

  // Deploy the contract
  const BlockchainEvidence = await ethers.getContractFactory("BlockchainEvidence");
  const contract = await BlockchainEvidence.deploy();
  
  // In ethers v6, you need to wait for the transaction to be mined
  const deploymentTransaction = contract.deploymentTransaction();
  await deploymentTransaction.wait();
  
  console.log("Contract deployed to:", await contract.getAddress());
}

// Execute the main function
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
