#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

set -a
source .env
set +a

mustache config/$NETWORK_CONFIG ./src/constants.txt > ./src/constants.ts

mustache config/$NETWORK_CONFIG ./src/vault/vaultsData.template.txt > ./src/vault/vaultsData.ts

mustache config/$NETWORK_CONFIG subgraph.template.yaml > subgraph.yaml

# # Run codegen and build
graph codegen
graph build

if [[ "$NO_DEPLOY" = true ]]
then
  rm subgraph.yaml
  exit 0
fi

# Use Studio The Graph Node (Only Mainnet and Rinkeby available)
if [[ "$GRAPH" == *"remote"* ]]
then
  graph auth --studio $ACCESS_TOKEN
  graph deploy --studio $SUBGRAPH_NAME
  # Remove manifest
  rm subgraph.yaml
  exit 0
fi

# Use Hosted The Graph Node
if [[ $GRAPH == *"hosted"* ]]
then
  graph auth --product hosted-service $ACCESS_TOKEN
  graph deploy --product hosted-service $SUBGRAPH_NAME
  # Remove manifest
  rm subgraph.yaml
  exit 0
fi

# Use Local The Graph Node
if [ "$GRAPH" == "local" ]
then
  # Select IPFS and The Graph nodes
  IPFS_NODE="http://localhost:5001"
  GRAPH_NODE="http://localhost:8020"
fi

if [ "$GRAPH" == "goerli" ] || [ "$GRAPH" = "kovan" ] || [ "$GRAPH" = "mainnet" ]
then
  # Select IPFS and The Graph nodes
  IPFS_NODE="http://ipfs:5001"
  GRAPH_NODE="http://graph-node:8020"
fi

# Create subgraph if missing
{
  graph create ${SUBGRAPH_NAME} --node ${GRAPH_NODE}
} || {
  echo 'Subgraph was already created'
}

# Deploy subgraph
graph deploy ${SUBGRAPH_NAME} --ipfs ${IPFS_NODE} --node ${GRAPH_NODE}
