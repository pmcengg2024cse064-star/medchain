const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Deploying OrganAllocationLedger smart contract to local network...");

  const contractName = "OrganAllocationLedger";
  const contractFactory = await hre.ethers.getContractFactory(contractName);

  const ledger = await contractFactory.deploy();
  await ledger.waitForDeployment();

  const address = await ledger.getAddress();
  console.log(`✅ ${contractName} deployed successfully!`);
  console.log("📍 Contract Address:", address);

  // Read compiled artifact
  const artifact = await hre.artifacts.readArtifact(contractName);
  const contractData = {
    address: address,
    abi: artifact.abi
  };

  // Sync with frontend contracts folder
  const frontendContractsDir = path.join(__dirname, "../../frontend/src/contracts");
  if (!fs.existsSync(frontendContractsDir)) {
    fs.mkdirSync(frontendContractsDir, { recursive: true });
  }

  const outputPath = path.join(frontendContractsDir, "OrganAllocationLedger.json");
  fs.writeFileSync(outputPath, JSON.stringify(contractData, null, 2));

  console.log(`📄 Saved contract address & ABI to: ${outputPath}`);
}

main().catch((error) => {
  console.error("❌ Deployment failed:", error);
  process.exitCode = 1;
});
