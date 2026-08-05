const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("AuraChainLedgerModule", (m) => {
  const ledger = m.contract("AuraChainLedger");
  return { ledger };
});
