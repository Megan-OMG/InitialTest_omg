// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title AssessmentToken
/// @dev   /// Known limitations:
///   - approve follows the standard ERC-20 allowance behavior, which has a
///     well-known race condition when changing a non-zero allowance. In production, this is typically handled by setting the allowance to zero before updating it.
///   - No access control, minting, or burning is included—the token supply is fixed when the contract is deployed.
contract AssessmentToken {
    /// @notice Token name
    string public name = "AssessmentToken";
    /// @notice Token ticker symbol
    string public symbol = "AST";
    /// @notice Number of decimals the token uses
    uint8 public decimals = 18;
    /// @notice Total token supply in the smallest unit
    uint256 public totalSupply;

    /// @notice Balance of each account in the smallest unit
    mapping(address => uint256) public balanceOf;
    /// @notice Remaining amount spender may spend on behalf of owner
    mapping(address => mapping(address => uint256)) public allowance;

    /// @notice Emitted on any transfer of value
    event Transfer(address indexed from, address indexed to, uint256 value);
    /// @notice Emitted whenever an allowance is set via approve
    event Approval(address indexed owner, address indexed spender, uint256 value);

    /// @param initialSupply Whole-token supply to mint to the deployer
    constructor(uint256 initialSupply) {
        totalSupply = initialSupply * 10 ** uint256(decimals);
        balanceOf[msg.sender] = totalSupply;
        emit Transfer(address(0), msg.sender, totalSupply);
    }

    /// @notice Transfer tokens from the caller to `to`
    /// @param to Recipient address
    /// @param value Amount to transfer, in the smallest unit.
    /// @return success Always true, reverts on failure.
    function transfer(address to, uint256 value) external returns (bool success) {
        require(to != address(0), "invalid recipient");
        require(balanceOf[msg.sender] >= value, "insufficient balance");

        balanceOf[msg.sender] -= value;
        balanceOf[to] += value;
        emit Transfer(msg.sender, to, value);
        return true;
    }

    /// @notice Approve spender to spend up to value of the caller's tokens
    /// @param spender Address allowed to spend
    /// @param value Allowance amount, in the smallest unit
    /// @return success Always true
    function approve(address spender, uint256 value) external returns (bool success) {
        require(spender != address(0), "invalid spender");

        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    /// @notice Transfer tokens from `from` to `to` using the caller's allowance
    /// @param from Address to debit
    /// @param to Recipient address
    /// @param value Amount to transfer, in the smallest unit
    /// @return success Always true; reverts on failure
    function transferFrom(address from, address to, uint256 value) external returns (bool success) {
        require(to != address(0), "invalid recipient");
        require(balanceOf[from] >= value, "insufficient balance");
        require(allowance[from][msg.sender] >= value, "allowance exceeded");

        balanceOf[from] -= value;
        balanceOf[to] += value;
        allowance[from][msg.sender] -= value;
        emit Transfer(from, to, value);
        return true;
    }
}
