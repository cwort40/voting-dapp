import React, { useState, useEffect } from "react";
import Web3 from "web3"; // eslint-disable-line no-unused-vars
import "./App.css";


//TODO: Make it so that users can vote once on each proposal, currently users can only vote once on any proposal
const VotingApp = () => {
  const [web3, setWeb3] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [contract, setContract] = useState(null);
  const [proposalsCount, setProposalsCount] = useState(0); // eslint-disable-line no-unused-vars
  const [proposals, setProposals] = useState([]);
  const [description, setDescription] = useState("");
  const [userVoted, setUserVoted] = useState({});


  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const web3Instance = new Web3(window.ethereum);
        setWeb3(web3Instance);

        const accounts = await web3Instance.eth.getAccounts();
        setAccounts(accounts);

        const networkId = await web3Instance.eth.net.getId(); // eslint-disable-line no-unused-vars

        // Replace the following ABI and contract address with your own
        const contractABI = [
          {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "uint256",
                "name": "proposalId",
                "type": "uint256"
              },
              {
                "indexed": false,
                "internalType": "string",
                "name": "description",
                "type": "string"
              }
            ],
            "name": "ProposalCreated",
            "type": "event"
          },
          {
            "anonymous": false,
            "inputs": [
              {
                "indexed": true,
                "internalType": "uint256",
                "name": "proposalId",
                "type": "uint256"
              },
              {
                "indexed": true,
                "internalType": "address",
                "name": "voter",
                "type": "address"
              }
            ],
            "name": "Voted",
            "type": "event"
          },
          {
            "inputs": [],
            "name": "owner",
            "outputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "stateMutability": "view",
            "type": "function",
            "constant": true
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "name": "proposals",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
              },
              {
                "internalType": "string",
                "name": "description",
                "type": "string"
              },
              {
                "internalType": "uint256",
                "name": "voteCount",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function",
            "constant": true
          },
          {
            "inputs": [],
            "name": "proposalsCount",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function",
            "constant": true
          },
          {
            "inputs": [
              {
                "internalType": "address",
                "name": "",
                "type": "address"
              }
            ],
            "name": "voters",
            "outputs": [
              {
                "internalType": "bool",
                "name": "",
                "type": "bool"
              }
            ],
            "stateMutability": "view",
            "type": "function",
            "constant": true
          },
          {
            "inputs": [
              {
                "internalType": "string",
                "name": "_description",
                "type": "string"
              }
            ],
            "name": "addProposal",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "_proposalId",
                "type": "uint256"
              }
            ],
            "name": "vote",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
          },
          {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "_proposalId",
                "type": "uint256"
              }
            ],
            "name": "getProposal",
            "outputs": [
              {
                "components": [
                  {
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                  },
                  {
                    "internalType": "string",
                    "name": "description",
                    "type": "string"
                  },
                  {
                    "internalType": "uint256",
                    "name": "voteCount",
                    "type": "uint256"
                  }
                ],
                "internalType": "struct Voting.Proposal",
                "name": "",
                "type": "tuple"
              }
            ],
            "stateMutability": "view",
            "type": "function",
            "constant": true
          }
        ];
        const contractAddress = "0x7ba03C93335118B9f6cE9F1d6D2955f35cB9ee63";
        const contractInstance = new web3Instance.eth.Contract(contractABI, contractAddress);
        setContract(contractInstance);

        const proposalsCount = await contractInstance.methods.proposalsCount().call();
        setProposalsCount(proposalsCount);

        let fetchedProposals = [];
        let userVotedStatus = {}; // Declare the variable here
        for (let i = 1; i <= proposalsCount; i++) {
          const proposal = await contractInstance.methods.getProposal(i).call();
          const userVoted = await contractInstance.methods.proposalVoters(i, accounts[0]).call();
          userVotedStatus[i] = userVoted;
          fetchedProposals.push(proposal);
        }
        setProposals(fetchedProposals);
        setUserVoted(userVotedStatus);

        //testing
        console.log("Fetched proposals:", fetchedProposals);
      }
    };

    init();
  }, []);

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccounts(accounts);
      } catch (error) {
        console.error("User denied account access");
      }
    } else {
      console.error("MetaMask is not installed");
    }
  };

  const createProposal = async () => {
    try {
      if (description) {
        await contract.methods.addProposal(description).send({ from: accounts[0], gas: 5000000 });

        // Add the newly created proposal to the state
        const newProposal = {
          id: proposalsCount + 1,
          description,
          voteCount: 0,
        };
        setProposals([...proposals, newProposal]);
        setDescription("");
      }
    } catch (error) {
      console.error("Error while creating proposal:", error.message || error);
    }
  };

  const vote = async (proposalId) => {
    try {
      await contract.methods.vote(proposalId).send({ from: accounts[0], gas: 5000000 });

      // Update the vote count for the voted proposal
      setProposals((prevProposals) =>
          prevProposals.map((proposal) => {
            if (proposal.id === proposalId) {
              return { ...proposal, voteCount: proposal.voteCount + 1 };
            }
            return proposal;
          })
      );

      // Update the userVoted state for the voted proposal
      setUserVoted({ ...userVoted, [proposalId]: true });

    } catch (error) {
      console.error("Error while voting:", error.message || error);
    }
  };



  return (
      <div className="App">
        <h1>Voting DApp</h1>
        {!accounts.length && (
            <div>
              <button onClick={connectMetaMask}>Connect MetaMask</button>
            </div>
        )}
        <h2>Create Proposal</h2>
        <input
            type="text"
            placeholder="Proposal description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
        />
        <button onClick={createProposal}>Create Proposal</button>
        <h2>Proposals</h2>
        <ul>
          {proposals.map((proposal) => (
              <li key={proposal.id}>
                {proposal.description} - Votes: {proposal.voteCount}
                <button
                    onClick={() => vote(proposal.id)}
                    disabled={userVoted[proposal.id] || false}
                >
                  Vote
                </button>
              </li>
          ))}
        </ul>

      </div>
  );

};

export default VotingApp;
