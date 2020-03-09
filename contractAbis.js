const masternodeAbi =  [
    {
        "inputs": [],
        "payable": false,
        "stateMutability": "nonpayable",
        "type": "constructor"

    },
    {
        "payable": true,
        "stateMutability": "payable",
        "type": "fallback"
    },
    {
        "constant": true,
        "inputs": [],
        "name": "blockPingTimeout",
        "outputs": [
        {
            "name": "",
            "type": "uint256"

        }

        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"

    },
    {
        "constant": true,
        "inputs": [],
        "name": "count",
        "outputs": [
        {
            "name": "",
            "type": "uint256"

        }

        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"

    },
    {
        "constant": true,
        "inputs": [
        {
            "name": "addr",
            "type": "address"

        }

        ],
        "name": "getId",
        "outputs": [
        {
            "name": "id",
            "type": "bytes8"

        }

        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"

    },
    {
        "constant": true,
        "inputs": [
        {
            "name": "id",
            "type": "bytes8"

        }

        ],
        "name": "getInfo",
        "outputs": [
        {
            "name": "id1",
            "type": "bytes32"

        },
        {
            "name": "id2",
            "type": "bytes32"

        },
        {
            "name": "preId",
            "type": "bytes8"

        },
        {
            "name": "nextId",
            "type": "bytes8"

        },
        {
            "name": "blockNumber",
            "type": "uint256"

        },
        {
            "name": "account",
            "type": "address"

        },
        {
            "name": "blockOnlineAcc",
            "type": "uint256"

        },
        {
            "name": "blockLastPing",
            "type": "uint256"

        }

        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"

    },
    {
        "constant": true,
        "inputs": [
        {
            "name": "addr",
            "type": "address"

        }

        ],
        "name": "getVoteInfo",
        "outputs": [
        {
            "name": "voteCount",
            "type": "uint256"

        },
        {
            "name": "startBlock",
            "type": "uint256"

        },
        {
            "name": "stopBlock",
            "type": "uint256"

        },
        {
            "name": "creator",
            "type": "address"

        },
        {
            "name": "lastAddress",
            "type": "address"

        }

        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"

    },
    {
        "constant": true,
        "inputs": [],
        "name": "governanceAddress",
        "outputs": [
        {
            "name": "",
            "type": "address"

        }

        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"

    },
    {
        "constant": true,
        "inputs": [
        {
            "name": "id",
            "type": "bytes8"

        }

        ],
        "name": "has",
        "outputs": [
        {
            "name": "",
            "type": "bool"

        }

        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"

    },
    {
        "constant": true,
        "inputs": [],
        "name": "lastId",
        "outputs": [
        {
            "name": "",
            "type": "bytes8"
        }
        ],
        "payable": false,
        "stateMutability": "view",
        "type": "function"
    }];

exports.masternodeAbi = masternodeAbi;
