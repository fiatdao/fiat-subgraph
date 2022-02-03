import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Notional } from "../generated/Notional/Notional";
import { Collateral } from "../generated/schema";
import { createVaultIfNonExistent } from "./vault/vaults";
import { VAULT_NOTIONAL_ADDRESS } from "./constants";
import { BIGINT_ZERO, getFaceValue, getMaturity, getSymbol, getToken, getUnderlierToken, getVaultType } from "./utils";

const NOTIONAL_COLLATERAL_TYPE = "fCash";
const VAULT_TYPE_ERC20 = "ERC20";

export function createCollateralIfNecessary(vault: string): Collateral | null {
  let typeHex = getVaultType(Address.fromString(vault));
  let type = Bytes.fromHexString(typeHex).toString();

  if (type.includes(VAULT_TYPE_ERC20)) {
    return createERC20CollateralIfNonExistent(vault, "0");
  }
  return null;
}

export function createERC20CollateralIfNonExistent(vault: string, tokenId: string): Collateral {
  let vaultAddress = Address.fromString(vault);
  let collateral = createCollateralIfNonExistent(vault, tokenId);
  let tokenAddress = getToken(vaultAddress);
  let underlierAddress = getUnderlierToken(vaultAddress);

  collateral.maturity = getMaturity(vaultAddress, BigInt.fromString(tokenId));
  setCollateralAddresses(collateral!, tokenAddress, underlierAddress);
  collateral.save();
  return collateral as Collateral;
}

export function createNotionalCollateralIfNonExistent(notional: Notional, tokenId: i32, maturity: BigInt): Collateral {
  let id = tokenId.toString();
  let collateral = createCollateralIfNonExistent(VAULT_NOTIONAL_ADDRESS, id);
  if (!collateral.address) {
    let currency = notional.getCurrency(tokenId);
    let tokenAddress = currency.value0.tokenAddress;
    let underlierAddress = currency.value1.tokenAddress;

    collateral.maturity = maturity;
    setCollateralAddresses(collateral!, tokenAddress, underlierAddress);
    createVaultIfNonExistent(VAULT_NOTIONAL_ADDRESS);
    collateral.save();
  }
  return collateral as Collateral;
}

export function createCollateralIfNonExistent(vault: string, tokenId: string): Collateral {
  let id = vault + "-" + tokenId;
  let collateral = Collateral.load(id);
  if (!collateral) {
    collateral = new Collateral(id);
    collateral.tokenId = BigInt.fromString(tokenId);
    collateral.depositedCollateral = BIGINT_ZERO;
    collateral.vault = vault;
    collateral.faceValue = getFaceValue();
    collateral.save();
  }
  return collateral as Collateral;
}

export function updateCollateral(vault: string, tokenId: string, deltaCollateral: BigInt): void {
  let collateral = createCollateralIfNonExistent(vault, tokenId);
  collateral.depositedCollateral = collateral.depositedCollateral.plus(deltaCollateral);
  collateral.save();
}

export function setCollateralAddresses(collateral: Collateral, collateralAddress: Address | null, underlierAddress: Address | null): void {
  collateral.address = collateralAddress;
  collateral.symbol = getSymbol(collateralAddress);
  collateral.underlierAddress = underlierAddress;
  collateral.underlierSymbol = getSymbol(underlierAddress);
}
