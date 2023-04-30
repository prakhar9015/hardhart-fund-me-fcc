require("@nomicfoundation/hardhat-toolbox")
require("hardhat-deploy")
require("dotenv").config()
require("@nomiclabs/hardhat-etherscan")
require("hardhat-gas-reporter")
// require("@nomiclabs/hardhat-waffle")

const SEPOLIA_RPC_URL =
    process.env.SEPOLIA_RPC_URL ||
    "https://eth-sepolia/expample/anything_for_fun.com"
const SEPOLIA_PRIVATE_KEY = process.env.SEPOLIA_PRIVATE_KEY || "0xkey" // 👈 this is just a random example.
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "0xkey"
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "0xkey"

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
    namedAccounts: {
        deployer: {
            default: 0, // here this will by default take the first account as deployer
            1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
        },
    },
    ////
    defaultNetwork: "hardhat",
    networks: {
        sepolia: {
            url: SEPOLIA_RPC_URL,
            accounts: [SEPOLIA_PRIVATE_KEY],
            chainId: 11155111,
            blockConfirmations: 6,
        },
    },

    // this is settings of the blockchain of my choice to deploy the contract. either use
    // automatically hardhat real blockchain simulation. or a specific testnet like, sepolia testenet --> if so then provide its Rpc Url and provate key to work with this.
    localhost: {
        url: "http://127.0.0.1:8545/",
        // accounts: // it will be auto assigned by hardhat
        chainId: 31337, // chain Id of hardhat.
    },
    // solidity: "0.8.18",
    solidity: {
        compilers: [{ version: "0.8.8" }, { version: "0.6.6" }],
    },

    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    // this code makes sure that i am getting the gasReporter provide by solidity . so by allowing and making
    // changes and yes & no to this file. I can get specific stuffs which i want from this framework.
    gasReporter: {
        enabled: true, // false
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD", // any currency INR...
        coinmarketcap: COINMARKETCAP_API_KEY,
        token: "ETH",
    },
}
