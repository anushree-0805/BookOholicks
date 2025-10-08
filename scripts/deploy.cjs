const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying BookoholicsNFT to U2U Mainnet...");

  // Get the contract factory
  const BookoholicsNFT = await hre.ethers.getContractFactory("BookoholicsNFT");

  console.log("📝 Deploying contract...");

  // Deploy the contract
  const contract = await BookoholicsNFT.deploy();

  await contract.waitForDeployment();

  const address = await contract.getAddress();

  console.log("✅ BookoholicsNFT deployed to:", address);
  console.log("🔗 View on U2U Explorer: https://u2uscan.xyz/address/" + address);

  // Wait for a few block confirmations
  console.log("⏳ Waiting for block confirmations...");
  await contract.deploymentTransaction().wait(5);

  console.log("✅ Contract verified and ready to use!");
  console.log("\n📋 Contract Details:");
  console.log("   - Address:", address);
  console.log("   - Network: U2U Solaris Mainnet");
  console.log("   - Chain ID: 39");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network: "u2u-mainnet",
    chainId: 39,
    contractAddress: address,
    deployedAt: new Date().toISOString(),
    deployer: (await hre.ethers.getSigners())[0].address
  };

  fs.writeFileSync(
    'deployment-mainnet.json',
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n💾 Deployment info saved to deployment-mainnet.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
