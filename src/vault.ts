import { Address } from "@graphprotocol/graph-ts";
import { Vault } from "../generated/schema";
import { Init } from "../generated/Codex/Codex";
import { IVault as IVaultContract } from "../generated/Codex/IVault";
import { createCollateralTypeIfNonExistent } from "./collateralType";
import { BIGINT_ZERO, WAD } from "./utils";
import { VAULT_CONFIG } from "./generated/config";

export function handleVaultInit(event: Init): void {
  createVaultIfNonExistent(event.params.vault);
}

export function createVaultIfNonExistent(vaultAddress: Address): Vault {
  let vault = Vault.load(vaultAddress.toHexString());
  if (vault == null) {
    vault = new Vault(vaultAddress.toHexString());
    let config = VAULT_CONFIG.get(vaultAddress.toHexString());
    if (config) {
      vault.name = (config.get('name')) as string;
      vault.type = (config.get('type')) as string;
      vault.address = Address.fromString((config.get('address')) as string)
    }
    vault.vaultType = IVaultContract.bind(vaultAddress).vaultType();

    vault.collateralizationRatio = WAD;
    vault.multiplier = WAD;
    vault.interestPerSecond = WAD;
    
    // set via SetParam
    vault.maxAuctionDuration = BIGINT_ZERO;
    vault.maxDiscount = BIGINT_ZERO;
    vault.auctionDebtFloor = BIGINT_ZERO;
    vault.debtCeiling = BIGINT_ZERO;
    vault.debtFloor = BIGINT_ZERO;
    vault.defaultRateId = BIGINT_ZERO;
    vault.save();

    createCollateralTypeIfNonExistent(vault, BIGINT_ZERO);
  }

  return vault as Vault;
}