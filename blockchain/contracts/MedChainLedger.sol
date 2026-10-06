// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title MedChainLedger
 * @dev Immutable smart contract ledger for recording organ allocation AI match decisions on-chain.
 */
contract MedChainLedger {
    
    struct MatchRecord {
        string patientId;
        string donorId;
        string organType;
        uint256 matchScore;
        uint256 timestamp;
        bytes32 recordHash;
        address registeredBy;
    }

    // Mapping from recordHash digest to MatchRecord
    mapping(bytes32 => MatchRecord) public records;

    // Array storing sequential record hashes for ledger enumeration
    bytes32[] public recordHashes;

    // Emitted when a new organ match record is minted to the blockchain
    event MatchMinted(
        bytes32 indexed recordHash,
        string patientId,
        string donorId,
        string organType,
        uint256 matchScore,
        uint256 timestamp,
        address indexed registeredBy
    );

    /**
     * @dev Hashes clinical match vector data with keccak256, stores record in mapping, and emits MatchMinted event.
     * @param _patientId Anonymous patient identifier
     * @param _donorId Anonymous donor identifier
     * @param _organType Type of organ (e.g. Kidney, Heart, Liver)
     * @param _matchScore AI confidence score percentage (0 - 100)
     */
    function mintMatchRecord(
        string memory _patientId,
        string memory _donorId,
        string memory _organType,
        uint256 _matchScore
    ) public returns (bytes32, uint256) {
        uint256 currentTimestamp = block.timestamp;

        // Cryptographic keccak256 hash digest of match tuple
        bytes32 recordHash = keccak256(
            abi.encodePacked(
                _patientId,
                _donorId,
                _organType,
                _matchScore,
                currentTimestamp,
                msg.sender
            )
        );

        MatchRecord memory newRecord = MatchRecord({
            patientId: _patientId,
            donorId: _donorId,
            organType: _organType,
            matchScore: _matchScore,
            timestamp: currentTimestamp,
            recordHash: recordHash,
            registeredBy: msg.sender
        });

        records[recordHash] = newRecord;
        recordHashes.push(recordHash);

        emit MatchMinted(
            recordHash,
            _patientId,
            _donorId,
            _organType,
            _matchScore,
            currentTimestamp,
            msg.sender
        );

        return (recordHash, currentTimestamp);
    }

    /**
     * @dev Fetches a record by its keccak256 hash.
     */
    function getRecord(bytes32 _recordHash) public view returns (MatchRecord memory) {
        require(records[_recordHash].timestamp != 0, "Record does not exist");
        return records[_recordHash];
    }

    /**
     * @dev Returns total number of minted match records.
     */
    function getTotalRecords() public view returns (uint256) {
        return recordHashes.length;
    }
}
