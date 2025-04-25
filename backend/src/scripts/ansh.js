import { Network, Alchemy } from 'alchemy-sdk';

const settings = {
  apiKey: process.env.ALCHEMY_API_KEY, // Replace with your Alchemy API key
  network: Network.ETH_MAINNET,
};

const alchemy = new Alchemy(settings);

async function main() {
  // Hash of the transaction you want to trace
  let txHash =
    "0x9e63085271890a141297039b3b711913699f1ee4db1acb667ad7ce304772036b";

  // Using the traceTransaction method to get the traces of the transaction
  let txTrace = await alchemy.debug.traceTransaction(txHash, {
    type: "callTracer",
  });

  // Logging the traces of the transaction
  console.log(txTrace);
}

// Calling the main function to run the code
main();