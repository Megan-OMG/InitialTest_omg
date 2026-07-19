const hre = require('hardhat');

// Deploy AssessmentToken
async function main() {
  const initialSupply = process.env.INITIAL_SUPPLY ? BigInt(process.env.INITIAL_SUPPLY) : 1000000n;

  const [deployer] = await hre.ethers.getSigners();
  const { chainId } = await hre.ethers.provider.getNetwork();

  console.log(`Network: ${hre.network.name} (chainId ${chainId})`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Initial supply: ${initialSupply.toString()} AST`);

  const factory = await hre.ethers.getContractFactory('AssessmentToken');
  const token = await factory.deploy(initialSupply);
  await token.waitForDeployment();

  console.log(`AssessmentToken deployed to: ${await token.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
