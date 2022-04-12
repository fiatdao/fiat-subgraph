# FIAT Subgraph

## Getting started: 

### Installation:
Run `yarn install` - make sure you have installed `yarn` globally (`npm i -g yarn`)

### Hosted Subgraphs:

- [Mainnet](https://thegraph.com/hosted-service/subgraph/fiatdao/fiat-subgraph)
- [Goerli](https://thegraph.com/hosted-service/subgraph/fiatdao/fiat-subgraph-goerli)

## Running Local Graph Node

Open the `docker-compose.yml` file and edit the `ethereum` node url you want to use.

- After cloning the repository and making sure you have `Docker` installed and running,
open the `docker-compose.yml` file and edit the `ethereum` node url you want to use. (ex: alchemy)
```sh
docker-compose build # building all the necessary images
```

- Run the Local Graph Node via:
```sh
docker-compose up
```

## Development

There are `npm scripts` for all the stages of subgraph development.

### Building the subgraph (code generation + creating the subgraph):
`yarn build`

### Deploy the Subgraph:
`CONFIG=<CONFIG_FILE_NAME> NETWORK=<NETWORK> TARGET=<TARGET> yarn deploy`

- CONFIG: `dev.json`, `mainnet.json`, `rinkeby.json`
- NETWORK: `local`, `mainnet`, `rinkeby`
- TARGET: `local`, `remote`, `studio`, `hosted-service` (optional)

In order to deploy to a remote node the `IPFS_NODE` and `GRAPH_NODE` has to be set:

`IPFS_NODE=<IPFS_NODE_URL> GRAPH_NODE=<GRAPH_NODE_URL CONFIG=<CONFIG_FILE_NAME> NETWORK=<NETWORK> yarn deploy`

In order to deploy to the hosted service the `ACCESS_TOKEN` has to be set:

`ACCESS_TOKEN=<THE_GRAPH_ACCESS_TOKEN> CONFIG=<CONFIG_FILE_NAME> NETWORK=<NETWORK> yarn deploy`

## Supported API's - implemented events from contracts:

### [Auction](https://github.com/fiatdao/fiat/blob/main/src/auctions/NoLossCollateralAuction.sol):

- [X] StartAuction
- [X] RedoAuction
- [X] TakeCollateral
- [X] StopAuction
- [X] UpdateAuctionDebtFloor
- [X] SetParam

### [Codex](https://github.com/fiatdao/fiat/blob/main/src/Codex.sol):

- [X] GrantDelegate
- [X] RevokeDelegate
- [X] ModifyBalance
- [X] TransferBalance
- [X] SetParam
- [X] Init
- [X] ModifyCollateralAndDebt
- [X] TransferCollateralAndDebt
- [X] ConfiscateCollateralAndDebt

### [FIAT](https://github.com/fiatdao/fiat/blob/main/src/FIAT.sol):

- [X] Transfer
- [X] Approve

### [Collybus](https://github.com/fiatdao/fiat/blob/main/src/Collybus.sol):

- [X] UpdateSpot
- [X] UpdateDiscountRate
- [X] SetParam

### [Publican](https://github.com/fiatdao/fiat/blob/main/src/Publican.sol):

- [X] SetParam

### [PRBProxyFactory](https://github.com/fiatdao/proxy/blob/main/contracts/PRBProxyFactory.sol):

- [X] DeployProxy
