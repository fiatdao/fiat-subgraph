import { Address, log } from "@graphprotocol/graph-ts";
import { Init } from "../../generated/Codex/Codex";
import { Vault } from "../../generated/schema";
import { createCollateralTypeIfNonExistent } from "../collateralType";
import { BIGINT_ZERO, WAD, getLiquidationRatio } from "../utils";
import { vaultsData } from "./vaultsData";

export function handleVaultInit(event: Init): void {
  let vaultAddress = event.params.vault;
  createVaultIfNonExistent(vaultAddress.toHexString());
}

export function createVaultIfNonExistent(vaultAddress: string): Vault {
  let vault = Vault.load(vaultAddress);
  if (vault == null) {
    vault = new Vault(vaultAddress);
    let config = vaultsData.get(vaultAddress);
    if (config) {
      vault.name = (config.get('name')) as string;
      vault.type = (config.get('type')) as string;
      vault.address = Address.fromString((config.get('address')) as string)
    }
    vault.collateralizationRatio = getLiquidationRatio(Address.fromString(vaultAddress));
    vault.multiplier = WAD;
    vault.interestPerSecond = WAD;
    // set via SetParam
    vault.maxAuctionDuration = BIGINT_ZERO;
    vault.maxDiscount = BIGINT_ZERO;
    vault.auctionDebtFloor = BIGINT_ZERO;
    vault.debtCeiling = BIGINT_ZERO;
    vault.debtFloor = BIGINT_ZERO;
    vault.save();

    log.debug("CreateVaultIfNonExistent: vaultAddress: {}", [vaultAddress]);
    createCollateralTypeIfNonExistent(vault, '0');
  }

  return vault as Vault;
}