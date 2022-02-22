import { Address } from "@graphprotocol/graph-ts";
import { Init } from "../../generated/Codex/Codex";
import { SetParam1 } from "../../generated/Codex/Collybus";
import { Vault } from "../../generated/schema";
import { createCollateralIfNecessary } from "../collaterals";
import { BIGINT_ZERO, getCollateralizationRatio } from "../utils";
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
    vault.multiplier = BIGINT_ZERO;
    vault.maxAuctionDuration = BIGINT_ZERO;
    vault.maxDiscount = BIGINT_ZERO;
    vault.auctionDebtFloor = BIGINT_ZERO;
    createCollateralIfNecessary(vault!);
    vault.save();
  }
  return vault as Vault;
}

export function handleSetParam(setParam: SetParam1): void {
  let vaultAddress = setParam.params.vault;
  let vault = createVaultIfNonExistent(vaultAddress.toHexString());
  vault.collateralizationRatio = getCollateralizationRatio(vaultAddress);
  vault.save();
}
