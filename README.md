# Subgraph for the FIAT smart contract system indexing the following entities

## Getting started: 

### Installation:
Run `yarn install` - make sure you have installed `yarn` globally (`npm i -g yarn`)

### Hosted Subgraphs:

- [Mainnet](https://thegraph.com/hosted-service/subgraph/fiatdao/protocol-subgraph)
- [Goerli Testnet](https://thegraph.com/hosted-service/subgraph/fiatdao/protocol-subgraph-goerli)

### Commands:

There are `yarn scripts` for all the stages of subgraph development.

- Building the subgraph (code generation + creating the subgraph): `yarn run build`
- Deploying to the Local Graph Node: `yarn run deploy:local`
- Deploying to the Goerli Graph Node: `yarn run deploy:goerli`
- Deploying to the Mainnet Graph Node: `yarn run deploy:mainnet`
- Deploying to the Goerli-Remote Graph Node: `yarn run deploy:goerli-remote`
- Deploying to the Mainnet-Remote Graph Node: `yarn run deploy:mainnet-remote`
- Deploying to the Goerli-Hosted Graph Node: `yarn run deploy:goerli-hosted`
- Deploying to the Mainnet-Hosted Graph Node: `yarn run deploy:mainnet-hosted`

For more info see [deploy.sh](/deploy.sh)

### Running Local Graph Node via Docker:
- After cloning the repository and making sure you have `Docker` installed
- Open the `docker-compose.yml` file and edit the `ethereum` node url you want to use. (ex: alchemy)
    
        docker-compose build # building all the necessary images

- Run the Local Graph Node via:

        docker-compose up

> In every way remember to create an .env file before you start the `docker-compose`, see [.env.example](/.env.example) for example
> Local development only requires the `NETWORK_CONFIG` and `SUBGRAPH_NAME`.
> Remote development requires the `ACCESS_TOKEN` of the created Subgraph.
> FYI if you want to deploy locally the mainnet config, edit env `NETWORK_CONFIG=mainnet.json` and execute: `yarn run deploy:local`

### Running tests:
#### For installation please see: [matchstick](https://github.com/LimeChain/matchstick)
For more info and documentation: [subgraph](https://github.com/LimeChain/demo-subgraph)

    `yarn run build` - to create subgraph.yaml
    `yarn run test` - to run all test files

TODO: Some of the tests will be completed when it's decided what we do with mocking and contract calls

# Supported API's - implemented events from contracts:

- ## [Auction](https://github.com/fiatdao/fiat/blob/main/src/auctions/NoLossCollateralAuction.sol):

`StartAuction, RedoAuction, TakeCollateral, StopAuction, UpdateAuctionDebtFloor, SetParam`

- ## [Codex](https://github.com/fiatdao/fiat/blob/main/src/Codex.sol):

`GrantDelegate, RevokeDelegate, Lock, ModifyBalance, TransferBalance, SetParam`

- ## [Codex Positions](https://github.com/fiatdao/fiat/blob/main/src/Codex.sol):

`ModifyCollateralAndDebt, TransferCollateralAndDebt, ConfiscateCollateralAndDebt`

- ## [FIAT](https://github.com/fiatdao/fiat/blob/main/src/FIAT.sol):

`FIATTransfer, FIATApprovals`

- ## [Collybus](https://github.com/fiatdao/fiat/blob/main/src/Collybus.sol):

`CollybusUpdateSpot, CollybusUpdateDiscountRate, CollybusSetParam`

- ## [Vault](https://github.com/fiatdao/fiat/blob/main/src/Vault.sol):

`VaultInit`

- ## [Publican](https://github.com/fiatdao/fiat/blob/main/src/Publican.sol):

`PublicanSetParam`

- ## Notional:

`MarketsInitialized`

- ## UserProxy:

`DeployProxy`