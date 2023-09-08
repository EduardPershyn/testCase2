# Test Case 2

Critical Issues
1) No check on array for joinPonzi(address[] calldata afilliates).
Can take arbitrary array as long as its length is matched.
Thus, anybody can become affiliate free of charge.
2) With buyOwnerRole(address newAdmin) and ownerWithdraw(address to, uint256 amount) any
affiliate with 10 ethers can become an owner and return spent ethers right afterward.

Medium Risk Findings
1) Method payable(to).call without transaction status check.
This can lead to confusion with ownerWithdraw executed successfully where it is not.
2) affiliates_ array can grow endlessly and reach gas limit eventually

Gas Optimizations 
1) onlyAfilliates() modifier uses loop to check if sender is affiliate instead of checking it through the 
mapping(address => bool) affiliates.

Low Risk and Non-Critical Issues
1) buyOwnerRole, ownerWithdraw and addNewAffilliate lacks zero-check on address parameter

To execute PoC run
```
npx hardhat test
```


