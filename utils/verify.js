const { run } = require("hardhat")

// this function or block of code is catching the exceptions and don't let the code crash.
async function verify(contractAddress, args) {
    console.log("Verifying contract...🚀")
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        })
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified!")
        } else {
            console.log(e)
        }
    }
}

module.exports = { verify }
