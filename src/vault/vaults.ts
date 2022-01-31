import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Init } from "../../generated/Codex/Codex";
import { Vault } from "../../generated/schema";
import { createCollateralIfNecessary } from "../collaterals";
import { BIGINT_ZERO } from "../utils";
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
    vault.depositedCollateral = BIGINT_ZERO;

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

export function updateVault(vaultAddress: string, deltaCollateral: BigInt): void {
  let vault = createVaultIfNonExistent(vaultAddress);
  vault.depositedCollateral = vault.depositedCollateral.plus(deltaCollateral);
  vault.save();
}
