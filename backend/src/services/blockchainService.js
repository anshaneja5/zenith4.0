// services/blockchainService.js
import Web3 from 'web3';
import BlockchainEvidence from '../contracts/BlockchainEvidence.json' assert { type: 'json' };
import dotenv from 'dotenv';

dotenv.config();

class BlockchainService {
  constructor() {
    // Connect to Ethereum network (can be mainnet, testnet, or local)
    this.web3 = new Web3(process.env.BLOCKCHAIN_PROVIDER_URL);
    
    // Load smart contract
    this.contract = new this.web3.eth.Contract(
      BlockchainEvidence.abi,
      process.env.CONTRACT_ADDRESS
    );
    
    // Account that will submit transactions
    this.account = process.env.ETHEREUM_ACCOUNT;
    this.privateKey = process.env.ETHEREUM_PRIVATE_KEY;
  }

  async storeEvidenceHash(reportId, fileId, fileHash, metadata) {
    try {
      // Prepare transaction data
      const data = this.contract.methods.storeEvidence(
        reportId,
        fileId,
        fileHash,
        JSON.stringify(metadata)
      ).encodeABI();
      
      // Get the current gas price from the network
      const gasPrice = await this.web3.eth.getGasPrice();
      
      // Sign and send transaction with both gas and gasPrice
      const tx = {
        from: this.account,
        to: process.env.CONTRACT_ADDRESS,
        gas: 2000000,
        gasPrice: gasPrice, // Add this line
        data: data
      };
      
      console.log('Transaction config:', {
        from: this.account,
        to: process.env.CONTRACT_ADDRESS,
        gasPrice: gasPrice
      });
      
      const signedTx = await this.web3.eth.accounts.signTransaction(tx, this.privateKey);
      const receipt = await this.web3.eth.sendSignedTransaction(signedTx.rawTransaction);
      
      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Blockchain storage error:', error);
      throw error;
    }
  }
  
  async verifyEvidence(fileHash, fileId) {
    try {
      const result = await this.contract.methods.verifyEvidence(fileHash).call();
      
      // Check if the hash exists AND is associated with the correct file ID
      return {
        ...result,
        correctFile: result.exists && result.fileId === fileId
      };
    } catch (error) {
      console.error('Blockchain verification error:', error);
      throw error;
    }
  }  
  
}

export default new BlockchainService();
