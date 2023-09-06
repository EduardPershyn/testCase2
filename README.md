# Sample Hardhat Project

Critical Issues
1) No check on argument array for joinPonzi(address[] calldata _afilliates).
joinPonzi(address[] calldata _afilliates) can take arbitrary array value as long as its length is same as affiliates_
Thus anybody with enough ethers can become affiliate free of charge
2) Any affiliate with 10 ethers can become an owner and return spent ethers right afterward

Medium Risk Findings
1) Method payable(to).call without transaction status check.
This can lead to confusion that ownerWithdraw executed successfully where it is not.
2) affiliates_ array can grow endlessly and reach gas limit eventually

Gas Optimizations 
1) onlyAfilliates() modifier use loop to check if sender is affiliate instead of checking it through the 
mapping(address => bool) affiliates.

Low Risk and Non-Critical Issues
1) buyOwnerRole, ownerWithdraw and addNewAffilliate lacks zero-check on address parameter

```To execute PoC run
npx hardhat test
```


