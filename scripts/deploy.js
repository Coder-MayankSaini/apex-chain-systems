import hre from "hardhat";
import fs from "fs";

async function main() {
  console.log("🏎️ Deploying F1 Merchandise NFT Certificate Contract...");

  // Get the contract factory
  const MerchandiseNFT = await hre.ethers.getContractFactory("MerchandiseNFT");
  
  // Deploy the contract
  const merchandiseNFT = await MerchandiseNFT.deploy();
  
  // Wait for deployment
  await merchandiseNFT.waitForDeployment();
  
  const contractAddress = await merchandiseNFT.getAddress();
  
  console.log("✅ MerchandiseNFT deployed to:", contractAddress);
  console.log("🏁 Contract Details:");
  console.log("   Name: F1 Merchandise Certificate");
  console.log("   Symbol: F1CERT");
  console.log("   Network:", hre.network.name);
  
  // Save contract address for frontend
  const contractsDir = "./src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir, { recursive: true });
  }

  // Save address
  fs.writeFileSync(
    contractsDir + "/MerchandiseNFT-address.json",
    JSON.stringify({ address: contractAddress }, undefined, 2)
  );

  // Save ABI
  const artifactPath = "./artifacts/contracts/MerchandiseNFT.sol/MerchandiseNFT.json";
  const MerchandiseNFTArtifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  fs.writeFileSync(
    contractsDir + "/MerchandiseNFT.json",
    JSON.stringify(MerchandiseNFTArtifact, null, 2)
  );

  console.log("📁 Contract address and ABI saved to src/contracts/");
  
  // Verify on Polygonscan if not localhost
  if (hre.network.name === "amoy" && process.env.POLYGONSCAN_API_KEY) {
    console.log("⏳ Waiting for block confirmations before verification...");
    await merchandiseNFT.deploymentTransaction().wait(5);
    
    console.log("🔍 Verifying contract on Polygonscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Polygonscan!");
    } catch (error) {
      console.error("❌ Verification failed:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
