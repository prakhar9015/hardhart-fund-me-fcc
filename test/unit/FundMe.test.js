//   yarn hardhat coverage/test
// unit test only runs on staging tests

const { assert, expect } = require("chai")
const { deployments, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")

// getNamedAccounts is extracted from "hre -> hardhatruntime environment"

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async function () {
          let fundMe
          let deployer
          let mockV3Aggregator
          // this parseerror converts the 1 in there to 1 eth.  // check ethers documentation for parseUnits function // can use parseUnits to change any big number to eth or wei or gwei
          const sendValue = ethers.utils.parseEther("1") //"1000000000000000000" // 1eth = 10 ** 18

          beforeEach(async function () {
              // deploy the FundMe contract using the Hardhat

              // const accounts = await ethers.getSigners() // this will return whatever is in the accounts
              // const accountZero = accounts[0] // when i get hold of all the accounts, i can pick a specific one

              deployer = (await getNamedAccounts()).deployer
              // this fixture function lets us deploy our entire folder using as many tags as we want... tags??? --> mens the export...{all}, etc in bottom of some files in this project.
              // it means that i can run all the differnt contracts present in a folder using just one line.

              await deployments.fixture(["all"])

              // this ethers.getContract --> will give me the most recently deployed FundMe Contract
              fundMe = await ethers.getContract("FundMe", deployer)
              mockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              )
          })

          // this test is 👇 only for constructor function in FundMe.sol
          describe("constructor", async function () {
              it("sets the aggregator address correctly", async function () {
                  const response = await fundMe.getPriceFeed() // make sure that getPriceFeed == MockV3Aggregator, since I'm running the test locally.
                  assert.equal(response, mockV3Aggregator.address)
              })
          })

          // create tests for fund section --> which checks how much funds received
          describe("fund", async function () {
              it("Fails if you don't send enough ETH", async function () {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      // for this error test to pass i have to make sure that whatever is written in the "FundMe.sol"...for reverting the transaction if minimun usd is not enough == should match with the error code that i'm writing down here.
                      "You need to spend more ETH" // keep in mind that what you have in your test should match what you have in your contract for the reverts to match
                  )
              })

              it("updated the amount funded data structure", async function () {
                  await fundMe.fund({ value: sendValue })
                  const response = await fundMe.getAddressToAmountFunded(
                      deployer
                  )
                  assert.equal(response.toString(), sendValue.toString())
              })

              it("Adds funder to array of getFunder", async function () {
                  await fundMe.fund({ value: sendValue })
                  const funder = await fundMe.getFunder(0)
                  assert.equal(funder, deployer)
              })
          })

          describe("withdraw", async function () {
              // before testing the withdraw function, we're making sure that 1st we have some ETH in our contract, so we're sending some ETH in it before testing.
              beforeEach(async function () {
                  await fundMe.fund({ value: sendValue })
              })

              // to test this -> withdraw frunction --? "yar hardhat test --grep "withdraw ETH

              it("withdraw ETH from a single funder", async function () {
                  // Arrange

                  // fundMe function comes with a provider.
                  // .getBalance() --> gtets me the balance of any contrat.
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  // the maisn reason behing creating 2 functions, so staring and ending Value() is to  make sure that the ETH is being received at the right location.
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  // from the transactionReceipt --> i can get hold of geasUsed ...etc.

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice) // .mul() --> multiply the number, this syntax is of the BigNumber value.

                  // 👇 can use a breakpoint here to calculate, how much gas is used

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert
                  // how to find gasCost ?

                  assert.equal(endingFundMeBalance, 0) // because if we withdraw all the ETH, it should update it to 0.
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(), // so we're adding this cause, it's a BigNumber something of ethers.
                      endingDeployerBalance.add(gasCost).toString() // .toString() makes the object type BigNumber easier to read.
                      // .add() is of BigNumber3
                  )
              })

              //----------------------------------------------------------------------
              it("withdraw ETH from a single funder", async function () {
                  // Arrange

                  // fundMe function comes with a provider.
                  // .getBalance() --> gtets me the balance of any contrat.
                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  // the maisn reason behing creating 2 functions, so staring and ending Value() is to  make sure that the ETH is being received at the right location.
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)

                  // from the transactionReceipt --> i can get hold of geasUsed ...etc.

                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice) // .mul() --> multiply the number, this syntax is of the BigNumber value.

                  // 👇 can use a breakpoint here to calculate, how much gas is used

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert
                  // how to find gasCost ?

                  assert.equal(endingFundMeBalance, 0) // because if we withdraw all the ETH, it should update it to 0.
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(), // so we're adding this cause, it's a BigNumber something of ethers.
                      endingDeployerBalance.add(gasCost).toString() // .toString() makes the object type BigNumber easier to read.
                      // .add() is of BigNumber3
                  )
              })

              //^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

              it("allows us to withdraw with multiple getFunder", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[1]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  // the maisn reason behing creating 2 functions, so staring and ending Value() is to  make sure that the ETH is being received at the right location.
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.withdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  //Assert

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert
                  // how to find gasCost ?

                  assert.equal(endingFundMeBalance, 0) // because if we withdraw all the ETH, it should update it to 0.
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(), // so we're adding this cause, it's a BigNumber something of ethers.
                      endingDeployerBalance.add(gasCost).toString() // .toString() makes the object type BigNumber easier to read.
                      // .add() is of BigNumber3
                  )

                  // make sure that the getFunder are reset properly

                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })

              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners()
                  const attacker = accounts[1]
                  const attackerConnectedContract = await fundMe.connect(
                      attacker
                  )
                  await expect(
                      attackerConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe_NotOwner")
              })

              // ------------------------------------------------------------------

              it("cheaperWithdraw testing...", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[1]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }

                  const startingFundMeBalance =
                      await fundMe.provider.getBalance(fundMe.address)

                  // the maisn reason behing creating 2 functions, so staring and ending Value() is to  make sure that the ETH is being received at the right location.
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Act
                  const transactionResponse = await fundMe.cheaperWithdraw()
                  const transactionReceipt = await transactionResponse.wait(1)
                  const { gasUsed, effectiveGasPrice } = transactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)

                  //Assert

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )

                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  // Assert
                  // how to find gasCost ?

                  assert.equal(endingFundMeBalance, 0) // because if we withdraw all the ETH, it should update it to 0.
                  assert.equal(
                      startingFundMeBalance
                          .add(startingDeployerBalance)
                          .toString(), // so we're adding this cause, it's a BigNumber something of ethers.
                      endingDeployerBalance.add(gasCost).toString() // .toString() makes the object type BigNumber easier to read.
                      // .add() is of BigNumber3
                  )

                  // make sure that the getFunder are reset properly

                  await expect(fundMe.getFunder(0)).to.be.reverted

                  for (i = 1; i < 6; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      )
                  }
              })
          })
      })
