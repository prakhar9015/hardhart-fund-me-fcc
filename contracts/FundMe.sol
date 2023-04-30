// SPDX-License-Identifier: MIT
//Pragma
// to save gas and hence ETH and USD, make the visiblity of state variable from public to => either internal or private,
// because public causes lot more money.

pragma solidity ^0.8.7;

// Imports
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "./PriceConverter.sol";
import "hardhat/console.sol";

// error codes
error FundMe_NotOwner(); // put the name of the contract included with the error name...to know which contract is throwing the error.

// Interfaces, Libraries, Contract

// Ethereum Natural Language Specification Format (NatSpec). 👇
// @dev --> a note for developers

// By using natspec...i presume it is much like the "Docstring"... in python... to explain what each function works???
// same for here in solidity. I can use as many natspec / docstring for explaining the use of functions ... so that other developers can understand it.

// the reason we add these natspec tags here is to let natspec automatically add documentation for us.
// for it run -->    solc --userdoc --devdoc {name of the file}

/**
 * @title A contract for crowd funding
 * @author  Prakhar Rastogi
 * @notice  This contract is to demo a sample funding contract
 * @dev This implements price feeds as our library
 */

contract FundMe {
    // Type decelerations
    using PriceConverter for uint256;

    // State variables
    mapping(address => uint256) private s_addressToAmountFunded; // s_address... refres to that this variable is a {storage} keyword.
    address[] private s_funders;

    // Could we make this constant?  /* hint: no! We should make it immutable! */
    address private immutable i_owner; // from public => private because it is not imp. for others to know who is the owner.
    uint256 public constant MINIMUM_USD = 50 * 10 ** 18;

    AggregatorV3Interface private s_priceFeed; // this address is now modularize, and no matter what blockchain, I'm using it will understand

    // modifier

    modifier onlyOwner() {
        // revert(msg.sender == owner);
        if (msg.sender != i_owner) revert FundMe_NotOwner();
        _;
    }

    // cosole.log("hello world");

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
        s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }

    /**
     * @notice  This function funds this contract
     * @dev This implements price feeds as our library
     */

    // @param --- can also use param here to define parameters in functions
    // @ return -- what it returns

    function fund() public payable {
        //                                 👇 putting price feed here refers to the contract address of the external contract of chainlink  using any dynamic address of any blockchain/testnet which helps me to get the current value of ETH in USD.  via interface.
        require(
            msg.value.getConversionRate(s_priceFeed) >= MINIMUM_USD,
            "You need to spend more ETH"
        );
        // revert(PriceConverter.getConversionRate(msg.value) >= MINIMUM_USD, "You need to spend more ETH!");
        s_addressToAmountFunded[msg.sender] += msg.value;
        s_funders.push(msg.sender);
    }

    function withdraw() public onlyOwner {
        // this is just a for loop normal like javasScript

        //             👇 start          checks                       steps
        for (
            uint256 funderIndex = 0;
            funderIndex < s_funders.length;
            funderIndex++
        ) {
            address funder = s_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }
        s_funders = new address[](0);

        (bool success, ) = payable(msg.sender).call{
            value: address(this).balance
        }("");
        require(success, "Transfer failed");
    }

    // the main aim of creating this cheaperWithdraw() instead of normal withdraw() 👆 is because,
    // each time if we loop just for  checking whether the funders.index < funders.length, then it is merely costing me more gas for each loop
    // initially, i'm reading the data from s_funders.lenght => i.e, a storage variable which is gonna cost me a lot more gas
    // and also storing the data in a new storage variable. so to make it cheaper, use the {memory} variable instead of storage.

    function cheaperWithdraw() public payable onlyOwner {
        address[] memory m_funders = s_funders; // memory are lot cheaper than storage.
        // mappings can't be in memory

        for (
            uint256 funderIndex = 0;
            funderIndex < m_funders.length;
            funderIndex++
        ) {
            address funder = m_funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        s_funders = new address[](0);
        (bool success, ) = i_owner.call{value: address(this).balance}("");
        require(success, "Transfer failed");
    }

    // view/pure {all the getters function}

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getFunder(uint256 index) public view returns (address) {
        return s_funders[index];
    }

    function getAddressToAmountFunded(
        address funder
    ) public view returns (uint256) {
        return s_addressToAmountFunded[funder];
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return s_priceFeed;
    }
}

// // transfer
// payable(msg.sender).transfer(address(this).balance);
// // send
// bool sendSuccess = payable(msg.sender).send(address(this).balance);
// revert(sendSuccess, "Send failed");
// call

// Explainer from: https://solidity-by-example.org/fallback/
// Ether is sent to contract
//      is msg.data empty?
//          /   \
//         yes  no
//         /     \
//    receive()?  fallback()
//     /   \
//   yes   no
//  /        \
//receive()  fallback()

// Concepts we didn't cover yet (will cover in later sections)
// 1. Enum
// 2. Events
// 3. Try / Catch
// 4. Function Selector
// 5. abi.encode / decode
// 6. Hash with keccak256
// 7. Yul / Assembly
