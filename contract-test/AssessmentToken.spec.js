const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('AssessmentToken', () => {
  const SUPPLY = 1000n;
  const UNIT = 10n ** 18n;
  let token, owner, alice, bob;

  beforeEach(async () => {
    [owner, alice, bob] = await ethers.getSigners();
    const Factory = await ethers.getContractFactory('AssessmentToken');
    token = await Factory.deploy(SUPPLY);
    await token.waitForDeployment();
  });

  it('initializes metadata and mints the full supply to the deployer', async () => {
    expect(await token.name()).to.equal('AssessmentToken');
    expect(await token.symbol()).to.equal('AST');
    expect(await token.decimals()).to.equal(18n);
    expect(await token.totalSupply()).to.equal(SUPPLY * UNIT);
    expect(await token.balanceOf(owner.address)).to.equal(SUPPLY * UNIT);
  });

  it('transfers tokens and emits Transfer', async () => {
    await expect(token.transfer(alice.address, 100n * UNIT))
      .to.emit(token, 'Transfer')
      .withArgs(owner.address, alice.address, 100n * UNIT);
    expect(await token.balanceOf(alice.address)).to.equal(100n * UNIT);
  });

  it('reverts transfer on insufficient balance', async () => {
    await expect(token.connect(alice).transfer(bob.address, 1n)).to.be.revertedWith('insufficient balance');
  });

  it('reverts transfer to the zero address', async () => {
    await expect(token.transfer(ethers.ZeroAddress, 1n)).to.be.revertedWith('invalid recipient');
  });

  it('allows approving more than the current balance (ERC-20 semantics)', async () => {
    await expect(token.connect(alice).approve(bob.address, 5n * UNIT))
      .to.emit(token, 'Approval')
      .withArgs(alice.address, bob.address, 5n * UNIT);
    expect(await token.allowance(alice.address, bob.address)).to.equal(5n * UNIT);
  });

  it('reverts approve for the zero spender', async () => {
    await expect(token.approve(ethers.ZeroAddress, 1n)).to.be.revertedWith('invalid spender');
  });

  it('supports approve + transferFrom and decrements the allowance', async () => {
    await token.approve(alice.address, 50n * UNIT);
    await expect(token.connect(alice).transferFrom(owner.address, bob.address, 50n * UNIT))
      .to.emit(token, 'Transfer')
      .withArgs(owner.address, bob.address, 50n * UNIT);
    expect(await token.balanceOf(bob.address)).to.equal(50n * UNIT);
    expect(await token.allowance(owner.address, alice.address)).to.equal(0n);
  });

  it('reverts transferFrom when the allowance is exceeded', async () => {
    await token.approve(alice.address, 10n * UNIT);
    await expect(
      token.connect(alice).transferFrom(owner.address, bob.address, 20n * UNIT)
    ).to.be.revertedWith('allowance exceeded');
  });
});
