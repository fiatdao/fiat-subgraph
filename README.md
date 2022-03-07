# FIAT Subgraph

Subgraph for the FIAT smart contract system

Hosted Subgraphs: 
- [Mainnet](https://thegraph.com/hosted-service/subgraph/fiatdao/protocol-subgraph)
- [Goerli Testnet](https://thegraph.com/hosted-service/subgraph/fiatdao/protocol-subgraph-goerli)

## Running Local Graph Node

Open the `docker-compose.yml` file and edit the `ethereum` node url you want to use. (ex: alchemy)

## Development

There are `npm scripts` for all the stages of subgraph development.

1. Building the subgraph (code generation + creating the subgraph): `npm run build`
2. Deploying to the Local Graph Node: `npm run deploy:local`
3. Deploying to the Goerli Graph Node: `npm run deploy:goerli`
4. Deploying to the Mainnet Graph Node: `npm run deploy:mainnet`
5. Deploying to the Goerli-Remote Graph Node: `npm run deploy:goerli-remote`
6. Deploying to the Mainnet-Remote Graph Node: `npm run deploy:mainnet-remote`
7. Deploying to the Goerli-Hosted Graph Node: `npm run deploy:goerli-hosted`
7. Deploying to the Mainnet-Hosted Graph Node: `npm run deploy:mainnet-hosted`.

> Remember to edit the .env file and start the `docker-compose`.
> Local development only requires the `NETWORK_CONFIG` and `SUBGRAPH_NAME`.
> Remote development requires the `ACCESS_TOKEN` of the created Subgraph.
> F.e if you want to deploy locally the mainnet config, edit env `NETWORK_CONFIG=mainnet.json` and execute: `npm run deploy:local`

## Supported APIs

- [x] PRB Proxies for UserProxies
- [x] Codex for Positions and PositionTransactions
- [x] Codex for supported Vaults
