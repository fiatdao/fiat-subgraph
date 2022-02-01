import { Address } from "@graphprotocol/graph-ts";
import { Init } from "../../generated/Codex/Codex";
import { Vault } from "../../generated/schema";
import { createCollateralIfNecessary } from "../collaterals";
import { vaultsData } from "./vaultsData";

export function handleVaultInit(event: Init): void {
  let vaultAddress = event.params.vault;
  createVaultIfNonExistent(vaultAddress.toHexString());
}

export function createVaultIfNonExistent(vaultAddress: string): Vault {
  let vault = Vault.load(vaultAddress);
  if (vault == null) {
    vault = new Vault(vaultAddress);
    vault.address = Address.fromString(vaultAddress);

    let config = vaultsData.get(vaultAddress);
    if (config) {
      vault.name = (config.get('name')) as string;
      vault.type = (config.get('type')) as string;
    }
    createCollateralIfNecessary(vault!);
    vault.save();
  }
  return vault as Vault;
}
