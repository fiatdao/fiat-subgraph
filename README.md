# FIAT LUX Subgraph

Collection of Subgraphs to support the usage of FIAT LUX protocols.

Hosted Subgraph: TODO

https://thegraph.com/hosted-service/subgraph/fiatdao/subgraph?selected=playground

## Running Local Graph Node

Open the `docker-compose.yml` file and edit the `ethereum` node url you want to use.

## Development

There are `npm scripts` for all the stages of subgraph development.

1. Building the subgraph (code generation + creating the subgraph): `npm run build --config={config.json}`
2. Deploying to the Local Graph Node: `npm run deploy:local --config={config.json}`
3. Deploying to the Goerli Graph Node: `npm run deploy:goerli --config={config.json}`
4. Deploying to the Mainnet Graph Node: `npm run deploy:mainnet --config={config.json}`
5. Deploying to the Goerli-Remote Graph Node: `npm run deploy:goerli-remote --config={config.json}`
6. Deploying to the Mainnet-Remote Graph Node: `npm run deploy:mainnet-remote --config={config.json}`
7. Deploying to the Goerli-Hosted Graph Node: `npm run deploy:goerli-hosted --config={config.json}`
7. Deploying to the Mainnet-Hosted Graph Node: `npm run deploy:mainnet-hosted --config={config.json}`
   Where `{config.json}` is the file name of the config you want to deploy. F.e if you want to deploy locally the mainnet config execute: `npm run deploy:local --config=mainnet.json`

## Supported APIs

- [ ] PRB Proxies
- [ ] PRB Proxies for Users
