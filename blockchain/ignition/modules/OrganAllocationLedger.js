const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("OrganAllocationLedgerModule", (m) => {
  const ledger = m.contract("OrganAllocationLedger");
  return { ledger };
});
