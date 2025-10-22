require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      type: "http",
      url: "http://127.0.0.1:7545",
      chainId: 1337,
      accounts: ["0xf250eba2a8dab0edf6892a1b0af700d59233ece510bc39818b5b7d8858c19dc1"]
    },
      eclipseTestnet: {
      type: "http",
      url: "https://subnets.avax.network/eclipsecha/testnet/rpc",
      chainId: 555666,
      accounts: ["da563284613a8f5065eef60e4a9c2688709beb34aa5c0361833bc74ea91a2764"]
    }
  }
};
