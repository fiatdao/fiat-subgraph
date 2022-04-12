#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

set -a
# Exporting variables from the env file and making them available in the code below
source .env
set +a

mustache config/$NETWORK_CONFIG ./src/generated/config.template.txt > ./src/generated/config.ts

mustache config/$NETWORK_CONFIG subgraph.template.yaml > subgraph.yaml

# Run codegen and build
graph codegen
graph build

# Using only to build the app
if [[ "$NO_DEPLOY" = true ]]
then
  # Comment the line below in order to have the file, in order to run tests
  # rm subgraph.yaml
  exit 0
fi

# Use Studio The Graph Node (Only Mainnet and Rinkeby available)
if [[ "$GRAPH" == *"remote"* ]]
then
  # Authenticate with the private token and deploy the subgraph using the Studio option
  graph auth --studio $ACCESS_TOKEN
  graph deploy --studio $SUBGRAPH_NAME
  # Remove manifest
  rm subgraph.yaml
  exit 0
fi

# Use Hosted The Graph Node
if [[ $GRAPH == *"hosted"* ]]
then
  # Authenticate with the private token and deploy the subgraph using the Hosted service
  graph auth --product hosted-service $ACCESS_TOKEN
  graph deploy --product hosted-service $SUBGRAPH_NAME
  # Remove manifest
  rm subgraph.yaml
  exit 0
fi

# Use Local The Graph Node
if [ "$GRAPH" == "local" ] || [ "$GRAPH" == "goerli" ] || [ "$GRAPH" = "mainnet" ]
then
  # Select IPFS and The Graph nodes
  IPFS_NODE="http://localhost:5001"
  GRAPH_NODE="http://localhost:8020"
fi

# Create subgraph if missing
{
  graph create ${SUBGRAPH_NAME} --node ${GRAPH_NODE}
} || {
  echo 'Subgraph was already created'
}

# Deploy subgraph
graph deploy ${SUBGRAPH_NAME} --ipfs ${IPFS_NODE} --node ${GRAPH_NODE}

# Remove manifest
rm subgraph.yaml