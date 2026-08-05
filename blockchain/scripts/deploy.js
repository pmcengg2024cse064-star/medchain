const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying AuraChainLedger smart contract to local network...");

  const AuraChainLedger = await hre.ethers.getContractFactory("AuraChainLedger");
  const ledger = await AuraChainLedger.deploy();
  await ledger.waitForDeployment();

  const address = await ledger.getAddress();
  console.log("✅ AuraChainLedger deployed successfully!");
  console.log("📍 Contract Address:", address);

  // Read compiled artifact
  const artifact = await hre.artifacts.readArtifact("AuraChainLedger");
  const contractData = {
    address: address,
    abi: artifact.abi
  };

  // Sync with frontend contracts folder
  const frontendContractsDir = path.join(__dirname, "../../frontend/src/contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  const outputPath = path.join(frontendContractsDir, "AuraChainLedger.json");
  fs.writeFileSync(outputPath, JSON.stringify(contractData, null, 2));

  console.log(`📄 Saved contract address & ABI to: ${outputPath}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
