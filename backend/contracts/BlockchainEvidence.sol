// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract BlockchainEvidence {
    struct Evidence {
        string reportId;
        string fileId;
        string metadata;
        uint256 timestamp;
        address submitter;
    }
    
    // Map file hash to evidence details
    mapping(string => Evidence) private evidenceStore;
    
    // Event emitted when new evidence is stored
    event EvidenceStored(
        string reportId,
        string fileId,
        string fileHash,
        uint256 timestamp
    );
    
    /**
     * Store evidence hash and metadata on blockchain
     */
    function storeEvidence(
        string memory reportId,
        string memory fileId,
        string memory fileHash,
        string memory metadata
    ) public {
        // Ensure this hash hasn't been used before
        require(evidenceStore[fileHash].timestamp == 0, "Evidence with this hash already exists");
        
        // Store evidence details
        evidenceStore[fileHash] = Evidence({
            reportId: reportId,
            fileId: fileId,
            metadata: metadata,
            timestamp: block.timestamp,
            submitter: msg.sender
        });
        
        // Emit event
        emit EvidenceStored(reportId, fileId, fileHash, block.timestamp);
    }
    
    /**
     * Verify if evidence exists and return details
     */
    function verifyEvidence(string memory fileHash) public view returns (
        bool exists,
        string memory reportId,
        string memory fileId,
        string memory metadata,
        uint256 timestamp,
        address submitter
    ) {
        Evidence memory evidence = evidenceStore[fileHash];
        exists = evidence.timestamp > 0;
        
        return (
            exists,
            evidence.reportId,
            evidence.fileId,
            evidence.metadata,
            evidence.timestamp,
            evidence.submitter
        );
    }
}
