import hre from "hardhat";

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const address = await signer.getAddress();
  const balance = await hre.ethers.provider.getBalance(address);
  
  console.log("Network:", hre.network.name);
  console.log("Wallet Address:", address);
  console.log("Balance:", hre.ethers.formatEther(balance), "MATIC");
  
  if (balance == 0n) {
    console.log("\n⚠️  Your wallet has 0 MATIC!");
    console.log("📌 To get test MATIC:");
    console.log("   1. Go to: https://faucet.polygon.technology/");
    console.log("   2. Select 'Polygon Amoy Testnet'");
    console.log("   3. Paste your wallet address:", address);
    console.log("   4. Click 'Submit' to receive test MATIC");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
