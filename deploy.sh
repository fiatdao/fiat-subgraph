#!/usr/bin/env bash

# Exit script as soon as a command fails.
set -o errexit

# Exporting variables from the env file and making them available in the code below
set -a
source .env
set +a

# Generates files from templates
mustache config/$CONFIG ./src/generated/config.template.txt > ./src/generated/config.ts
mustache config/$CONFIG subgraph.template.yaml > subgraph.yaml

# Run codegen and build
graph codegen
graph build

if [[ "$NO_DEPLOY" = true ]]; then
  rm subgraph.yaml
  exit 0
fi

if [ "$NETWORK" == "mainnet" ]
then
  SUBGRAPH_NAME=fiatdao/fiat-subgraph
else 
  SUBGRAPH_NAME=fiatdao/fiat-subgraph-$NETWORK
fi

# Select IPFS and The Graph nodes
if [ "$TARGET" == "local" ] || [ "$TARGET" == "remote" ]
then
  if [ "$TARGET" == "local" ]
  then
    IPFS_NODE="http://localhost:5001"
    GRAPH_NODE="http://127.0.0.1:8020"
  fi
  # Create subgraph if missing
  {
    graph create $SUBGRAPH_NAME --node $GRAPH_NODE
  } || {
    echo 'Subgraph was already created'
  }
  # Deploy subgraph
  graph deploy $SUBGRAPH_NAME --ipfs $IPFS_NODE --node $GRAPH_NODE

  # Deploy subgraph, forking the fiatdao/fiat-subgraph subgraph on mainnet
  # NOTE: You must
  # 1. Update the startBlock in config/mainnet.json to the latest block (see here: https://thegraph.com/hosted-service/subgraph/fiatdao/fiat-subgraph)
  # 2. Run the subgraph with --fork-base flag (not in docker), e.g.
  #      cargo run -p graph-node --release -- --postgres-url postgresql://graph-node:let-me-in@localhost:5432/graph-node --ethereum-rpc mainnet:http://localhost:8545 --ipfs 127.0.0.1:5001 --fork-base https://api.thegraph.com/subgraphs/id/
  # Instructions to run graph-node locally here: https://github.com/graphprotocol/graph-node/#running-a-local-graph-node
  # graph deploy $SUBGRAPH_NAME --ipfs $IPFS_NODE --node $GRAPH_NODE --debug-fork Qma9ky6wWr9o9ufhmLsYRrqERGVkBKEMtsTQcjNvfB5NZq
elif [ "$TARGET" = "studio" ]
then
  # The Graph auth
  graph auth --studio hosted-service $ACCESS_TOKEN
  # Deploy subgraph
  graph deploy --studio $SUBGRAPH_NAME
elif [ "$TARGET" = "hosted-service" ]
then
  # The Graph auth
  graph auth --product hosted-service $ACCESS_TOKEN
  # Deploy subgraph
  graph deploy --product hosted-service $SUBGRAPH_NAME
fi

# Remove manifest
rm subgraph.yaml
