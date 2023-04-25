pragma solidity ^0.8.19;

contract Voting {
    struct Proposal {
        uint id;
        string description;
        uint voteCount;
    }

    address public owner;
    mapping(address => bool) public voters;
    mapping(uint => Proposal) public proposals;
    mapping(uint => mapping(address => bool)) public proposalVoters;
    uint public proposalsCount;

    event ProposalCreated(uint indexed proposalId, string description);
    event Voted(uint indexed proposalId, address indexed voter);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier notVoted(address _voter) {
        require(!voters[_voter], "Already voted");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addProposal(string memory _description) public onlyOwner {
        proposalsCount++;
        proposals[proposalsCount] = Proposal(proposalsCount, _description, 0);
        emit ProposalCreated(proposalsCount, _description);
    }

    function vote(uint _proposalId) public {
        require(_proposalId > 0 && _proposalId <= proposalsCount, "Invalid proposal ID");
        require(!proposalVoters[_proposalId][msg.sender], "Already voted on this proposal");

        proposalVoters[_proposalId][msg.sender] = true;
        proposals[_proposalId].voteCount++;

        emit Voted(_proposalId, msg.sender);
    }


    function getProposal(uint _proposalId) public view returns (Proposal memory) {
        require(_proposalId > 0 && _proposalId <= proposalsCount, "Invalid proposal ID");
        return proposals[_proposalId];
    }
}
