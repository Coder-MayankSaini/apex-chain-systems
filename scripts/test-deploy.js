import hre from "hardhat";

async function main() {
  console.log("🏎️ Test Deployment of MerchandiseNFT Contract...");

  try {
    // Get the contract factory
    const MerchandiseNFT = await hre.ethers.getContractFactory("MerchandiseNFT");
    
    // Deploy the contract
    console.log("📝 Deploying contract...");
    const merchandiseNFT = await MerchandiseNFT.deploy();
    
    // Wait for deployment
    await merchandiseNFT.waitForDeployment();
    
    const contractAddress = await merchandiseNFT.getAddress();
    
    console.log("✅ Contract deployed successfully!");
    console.log("📍 Contract Address:", contractAddress);
    console.log("🏁 Network:", hre.network.name);
    
    // Test minting a certificate
    console.log("\n🧪 Testing NFT minting...");
    const testAddress = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // First test account
    const tx = await merchandiseNFT.mintCertificate(
      testAddress,
      "TEST-PRODUCT-001",
      "ipfs://QmTest123",
      85, // 85% authenticity score
      "QR-TEST-001"
    );
    
    await tx.wait();
    console.log("✅ Test NFT minted successfully!");
    
    // Verify the certificate
    const certificate = await merchandiseNFT.getCertificate("TEST-PRODUCT-001");
    console.log("\n📋 Certificate Details:");
    console.log("   Product ID:", certificate.productId);
    console.log("   Authenticity Score:", certificate.authenticityScore.toString());
    console.log("   QR Code:", certificate.qrCode);
    
    console.log("\n🎉 All tests passed! Contract is ready for deployment to Polygon Amoy.");
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
