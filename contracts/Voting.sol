// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Voting {
    struct Candidate {
        string name;
        uint voteCount;
    }

    mapping(address => bool) public hasVoted;
    Candidate[] public candidates;
    address public owner;
    bool public votingOpen;

    constructor() {
        owner = msg.sender;
        candidates.push(Candidate("Vijay", 0));
        candidates.push(Candidate("Rajini", 0));
        candidates.push(Candidate("Kamal", 0));
        votingOpen = true;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this");
        _;
    }

    function vote(uint candidateIndex) external {
        require(votingOpen, "Voting has ended");
        require(!hasVoted[msg.sender], "You have already voted");
        require(candidateIndex < candidates.length, "Invalid candidate index");

        candidates[candidateIndex].voteCount += 1;
        hasVoted[msg.sender] = true;
    }

    function endVoting() external onlyOwner {
        votingOpen = false;
    }

    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }

    function getWinner() external view returns (string memory winnerName, uint winnerVotes) {
        require(!votingOpen, "Voting still in progress");

        uint maxVotes = 0;
        uint winnerIndex = 0;

        for (uint i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winnerIndex = i;
            }
        }
        return (candidates[winnerIndex].name, candidates[winnerIndex].voteCount);
    }
}
