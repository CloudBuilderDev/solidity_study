// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

abstract contract ManagedAccess {
    address public owner;
    address public manager;
    constructor(address _owner) {
        owner = _owner;
    }
    function setManager(address _manager) external {
        manager = _manager;
    }
    modifier ownerOnly() {
        require(msg.sender == owner, "You are not authorized");
        _;  
    }
    modifier OnlyManager() {
        require(msg.sender == manager, "You are not authorized to manage this contract");
        _;
    }
}