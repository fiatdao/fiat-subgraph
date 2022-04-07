import { Address } from "@graphprotocol/graph-ts";
import { Init } from "../../generated/Codex/Codex";
import { Vault } from "../../generated/schema";
import { createCollateralIfNecessary } from "../collateralType";
import { BIGINT_ZERO, WAD, getCollateralizationRatio } from "../utils";
import { log } from '@graphprotocol/graph-ts'
import { vaultsData } from "./vaultsData";

export function handleVaultInit(event: Init): void {
  let vaultAddress = event.params.vault;
  log.debug("Vault1: " + vaultAddress.toString(), [])
  
  createVaultIfNonExistent(vaultAddress.toHexString());
}

export function createVaultIfNonExistent(vaultAddress: string): Vault {
  let vault = Vault.load(vaultAddress);
  if (vault == null) {
    vault = new Vault(vaultAddress);
    let address = Address.fromString(vaultAddress);

    let config = vaultsData.get(vaultAddress);
    log.debug("Address2: " + address.toString(), [])
    log.debug("VaultAddr2: " + vaultAddress, [])
    if (config) {
      vault.name = (config.get('name')) as string;
      vault.type = (config.get('type')) as string;
      vault.address = Address.fromString((config.get('VaultEPT')) as string)
      vault.convergentCurvePool = Address.fromString((config.get('ConvergentCurvePool')) as string)
    }
    vault.collateralizationRatio = getCollateralizationRatio(address);
    vault.multiplier = WAD;
    vault.interestPerSecond = WAD;
    vault.maxAuctionDuration = BIGINT_ZERO;
    vault.maxDiscount = BIGINT_ZERO;
    vault.auctionDebtFloor = BIGINT_ZERO;
    vault.debtCeiling = BIGINT_ZERO;
    vault.debtFloor = BIGINT_ZERO;
    createCollateralIfNecessary(vault);
    vault.save();
  }
  return vault as Vault;
}