// ---> same as , hre.getNameAccounts() or hre.deployments()

const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { network } = require("hardhat")
const { verify } = require("../utils/verify")
require("dotenv").config()

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // if chainId is X use address Y

    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethPriceFeed"]

    let ethUsdPriceFeedAddress
    // if (developmentChains.includes(network.name)) {
    if (chainId == 31337) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    //  mocking a blockchain in javascript --> if the contract doesn't exist, we deploy a minimal version of for our local testing

    // well what happens when we want to change chains?
    // when going for localhist or hardhat network we want to use a mock
    // const FundMe = await ethers.getContractFactory("FundMe")

    // const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        // who's deploying
        from: deployer,
        args: [ethUsdPriceFeedAddress], // put proceFeed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    log(`FundMe deployed at ${fundMe.address}`)

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        // verify
        // create utils -folder ---means utility
        await verify(fundMe.address, [ethUsdPriceFeedAddress])
    }
    log("---------------------------------------------------------")
}

module.exports.tags = ["all", "fundme"]
