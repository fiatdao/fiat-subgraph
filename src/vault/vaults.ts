import { Address } from "@graphprotocol/graph-ts";
import { Init } from "../../generated/Codex/Codex";
import { SetParam1 } from "../../generated/Codex/Collybus";
import { Vault } from "../../generated/schema";
import { createCollateralIfNecessary } from "../collaterals";
import { BIGINT_ZERO, WAD, getCollateralizationRatio } from "../utils";
import { vaultsData } from "./vaultsData";

export function handleVaultInit(event: Init): void {
  let vaultAddress = event.params.vault;
  createVaultIfNonExistent(vaultAddress.toHexString());
}

export function createVaultIfNonExistent(vaultAddress: string): Vault {
  let vault = Vault.load(vaultAddress);
  if (vault == null) {
    vault = new Vault(vaultAddress);
    let address = Address.fromString(vaultAddress);

    let config = vaultsData.get(vaultAddress);
    if (config) {
      vault.name = (config.get('name')) as string;
      vault.type = (config.get('type')) as string;
    }
    vault.address = address;
    vault.collateralizationRatio = getCollateralizationRatio(address);
    vault.multiplier = WAD;
    vault.interestPerSecond = WAD;
    vault.maxAuctionDuration = BIGINT_ZERO;
    vault.maxDiscount = BIGINT_ZERO;
    vault.auctionDebtFloor = BIGINT_ZERO;
    let collateral = createCollateralIfNecessary(vault);
    if (collateral !== null && vault.type === "ELEMENT") {
      collateral.ccp = collateral.address!.toHexString();
    }
    vault.save();
  }
  return vault as Vault;
}

export function handleCollybusSetParam(setParam: SetParam1): void {
  let vaultAddress = setParam.params.vault;
  let vault = createVaultIfNonExistent(vaultAddress.toHexString());
  vault.collateralizationRatio = getCollateralizationRatio(vaultAddress);
  vault.save();
}
