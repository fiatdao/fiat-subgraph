import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Notional } from "../generated/Notional/Notional";
import { Collateral, Vault } from "../generated/schema";
import { createVaultIfNonExistent } from "./vault/vaults";
import { VAULT_NOTIONAL_ADDRESS } from "./constants";
import { BIGINT_ZERO, getCollaterizationRatio, getCurrentValue, getFaceValue, getMaturity, getSymbol, getToken, getUnderlierToken, getVaultType } from "./utils";

const NOTIONAL_COLLATERAL_TYPE = "fCash";
const VAULT_TYPE_ELEMENT = "ERC20";

export function createCollateralIfNecessary(vault: Vault): void {
  let typeHex = getVaultType(vault.address as Address);
  let type = Bytes.fromHexString(typeHex).toString();

  if (type.includes(VAULT_TYPE_ELEMENT)) {
    let tokenId = "0";
    let tokenAddress = getToken(vault.address as Address);
    let id = tokenAddress.toHexString() + "-" + tokenId;
    let collateral = createCollateralIfNonExistent(vault.id, id);
    let underlierAddress = getUnderlierToken(vault.address as Address);

    collateral.address = tokenAddress;
    collateral.symbol = getSymbol(tokenAddress);
    collateral.maturity = getMaturity(vault.address as Address, BigInt.fromString(tokenId));
    collateral.underlierAddress = underlierAddress;
    collateral.underlierSymbol = getSymbol(underlierAddress);
    collateral.vault = vault.id;
    // collateral.currentValue = getCurrentValue(vault.address as Address, collateral.underlierAddress as Address, BigInt.fromString(id), BigInt.fromString(collateral.maturity));
    collateral.save();
  }
}

export function createNotionalCollateralIfNonExistent(notional: Notional, currencyId: i32, maturity: BigInt): Collateral {
  let id = currencyId.toString() + "-" + maturity.toString();
  let collateral = Collateral.load(id);
  if (!collateral) {
    collateral = createCollateralIfNonExistent(VAULT_NOTIONAL_ADDRESS, id);
    let currency = notional.getCurrency(currencyId);
    let tokenAddress = currency.value0.tokenAddress;
    let underlierAddress = currency.value1.tokenAddress;

    collateral.address = tokenAddress;
    collateral.symbol = getSymbol(tokenAddress) + "-" + maturity.toString();
    collateral.maturity = maturity;
    collateral.underlierAddress = underlierAddress;
    collateral.underlierSymbol = getSymbol(underlierAddress);
    // collateral.type = NOTIONAL_COLLATERAL_TYPE;
    createVaultIfNonExistent(VAULT_NOTIONAL_ADDRESS);
    // collateral.currentValue = getCurrentValue(Address.fromString(VAULT_NOTIONAL_ADDRESS), collateral.underlierAddress as Address, BigInt.fromString(id), maturity);
    collateral.save();
  }
  return collateral as Collateral;
}

export function createCollateralIfNonExistent(vault: string, id: string): Collateral {
  let collateral = Collateral.load(id);
  if (!collateral) {
    collateral = new Collateral(id);
    collateral.depositedCollateral = BIGINT_ZERO;
    collateral.vault = vault;
    collateral.faceValue = getFaceValue();
    collateral.collaterizationRatio = getCollaterizationRatio(Address.fromString(vault));
    collateral.save();
  }
  return collateral as Collateral;
}

export function updateCollateral(vault: string, tokenId: string, deltaCollateral: BigInt): void {
  let collateral = createCollateralIfNonExistent(vault, tokenId);
  collateral.depositedCollateral = collateral.depositedCollateral.plus(deltaCollateral);
  collateral.save();
}
