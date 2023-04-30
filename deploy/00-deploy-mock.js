const { network } = require("hardhat")
const {
    developmentChains,
    DECIMALS,
    INITIAL_ANSWER,
} = require("../helper-hardhat-config") // i'm just exporting those 3 specified variables from the helper-hardhat-config file. go check it...

//  run this --------> yarn hardhat deploy --tags mocks

// const { Contract } = require("ethers")

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // includes --> Determines whether an array includes a certain element, returning true or false as appropriate
    if (developmentChains.includes(network.name)) {
        // if (chainId == 31337) {
        console.log(developmentChains)
        // if ()) {
        log("Local network detected! Deploying mocks...")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
            from: deployer,
            log: true,
            args: [DECIMALS, INITIAL_ANSWER],
        })
        log("Mocks deployed!")
        log(
            "------------------------------------------It's Done ------------------"
        )
    }
}

module.exports.tags = ["all", "mocks"]
