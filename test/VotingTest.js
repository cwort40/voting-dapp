const Voting = artifacts.require("Voting");

contract("Voting", (accounts) => {
    let voting;

    beforeEach(async () => {
        voting = await Voting.deployed();
    });

    it("should create a proposal", async () => {
        await voting.addProposal("Proposal 1", { from: accounts[0] });
        const proposal = await voting.getProposal(1);
        assert.equal(proposal.description, "Proposal 1", "Description should match");
        assert.equal(proposal.voteCount, 0, "Vote count should be zero");
    });

    it("should vote for a proposal", async () => {
        await voting.vote(1, { from: accounts[1] });
        const proposal = await voting.getProposal(1);
        assert.equal(proposal.voteCount, 1, "Vote count should be one");
    });
});
