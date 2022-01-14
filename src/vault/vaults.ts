import { Bytes } from "@graphprotocol/graph-ts";
import { Init } from "../../generated/Codex/Codex";
import { Vault } from "../../generated/schema";
import { vaultsData } from "./vaultsData";

import { log } from '@graphprotocol/graph-ts'

export function handleVaultInit(event: Init): void {
  let vaultAddress = event.params.vault;
  createVaultIfNonExistent(vaultAddress);
}

export function createVaultIfNonExistent(vaultAddress: Bytes): Vault {
  let address = vaultAddress.toHexString();
  let vault = Vault.load(address);
  if (vault == null) {
    vault = new Vault(address);
    vault.address = vaultAddress;

    let config = vaultsData.get(address);
    if (config) {
      vault.name = ( config.get('name')) as string;
      vault.underlyingAsset = ( config.get('underlyingAsset')) as string;
      vault.originator = (config.get('originator'))  as string;
      vault.type = (config.get('type'))  as string;
    }
    vault.save();
  }
  return vault as Vault;
}
