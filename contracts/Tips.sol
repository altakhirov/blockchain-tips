// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.14;

contract Tips {
    // "public" makes variables accessible from other contracts
    address public minter;
    mapping (address => uint) public balances;

    // Events allow clients to react to specific contract changes 
    event Sent(address from, address to, uint amount);

    // runs once when the contract is created
    constructor() {
        minter = msg.sender;
    }

    // can be called by creator only
    function mint(address receiver, uint amount) public {
        require(msg.sender == minter);
        balances[receiver] += amount;
    }

    // Error provides an information about failed operation
    error InsufficientBalance(uint requested, uint available);

    // Sends coins from any caller to an address
    function send(address receiver, uint amount) public {
        if (amount > balances[msg.sender])
            revert InsufficientBalance({
                requested: amount,
                available: balances[msg.sender]
            });

        balances[msg.sender] -= amount;
        balances[receiver] += amount;
        emit Sent(msg.sender, receiver, amount);
    }

    // Get account balance
    function balanceOf(address account) external view returns (uint256) {
        return balances[account];
    }
}