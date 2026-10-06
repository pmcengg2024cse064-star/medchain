const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("MedChainLedgerModule", (m) => {
  const ledger = m.contract("MedChainLedger");
  return { ledger };
});
