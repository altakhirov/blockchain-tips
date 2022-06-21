// We import Chai to use its asserting functions here
const { expect } = require("chai");

describe("Tips contract", function (){
	let Tips;
	let hardhatTips;
	let owner;
	let addr1;
	let addr2;

	beforeEach(async function(){
		Tips = await ethers.getContractFactory("Tips");
		[owner, addr1, addr2] = await ethers.getSigners();

		hardhatTips = await Tips.deploy();

		await hardhatTips.mint(owner.address, 1000);
		await hardhatTips.mint(addr1.address, 500);
	});

	describe("Deployment", function (){

		it("Should set the right owner", async function(){
			expect(await hardhatTips.minter()).to.equal(owner.address);
		});

		it("Should mint coins by owner", async function(){
			const ownerBalance = await hardhatTips.balanceOf(owner.address)
			const addr1Balance = await hardhatTips.balanceOf(addr1.address)
			expect(ownerBalance).to.equal(1000);
			expect(addr1Balance).to.equal(500);
		});
	});

	describe("Transactions", function () {
		it("Should transfer tokens between accounts", async function() {

			// Transfer 100 tokens from owner to addr1
			await hardhatTips.send(addr1.address, 100);
			const addr1balance = await hardhatTips.balanceOf(addr1.address);
			expect(addr1balance).to.equal(600);

			// Transfer 100 tokens from addr1 to addr2
			await hardhatTips.connect(addr1).send(addr2.address, 100);
			const addr2balance = await hardhatTips.balanceOf(addr2.address);
			expect(addr2balance).to.equal(100);
		});

		it("Should fail if sender doesn’t have enough tokens", async function () {
		  const initialOwnerBalance = await hardhatTips.balanceOf(owner.address);

		  // Try to send 200 token from addr2 (0 tokens) to owner.
		  // `require` will evaluate false and revert the transaction.
		  await expect(
			hardhatTips.connect(addr2).send(owner.address, 200)
		  ).to.be.revertedWith("InsufficientBalance");

		  // Owner balance shouldn't have changed.
		  expect(await hardhatTips.balanceOf(owner.address)).to.equal(initialOwnerBalance);
		});

		it("Should update balances after transfers", async function () {
		  const initialOwnerBalance = await hardhatTips.balanceOf(owner.address);

		  // Transfer 100 tokens from owner to addr1.
		  await hardhatTips.send(addr1.address, 100);

		  // Transfer another 50 tokens from owner to addr2.
		  await hardhatTips.send(addr2.address, 50);

		  // Check balances.
		  const finalOwnerBalance = await hardhatTips.balanceOf(owner.address);
		  expect(finalOwnerBalance).to.equal(initialOwnerBalance.sub(150));

		  const addr1Balance = await hardhatTips.balanceOf(addr1.address);
		  expect(addr1Balance).to.equal(600);

		  const addr2Balance = await hardhatTips.balanceOf(addr2.address);
		  expect(addr2Balance).to.equal(50);
		});
	});
});