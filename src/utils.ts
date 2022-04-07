import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Codex, Codex__positionsResult } from "../generated/Codex/Codex";
import { Collybus } from "../generated/Codex/Collybus";
import { IVault } from "../generated/Codex/IVault";
import { CollateralAuction } from "../generated/CollateralAuction/CollateralAuction";
import { FIAT } from "../generated/FIAT/FIAT";
import { ERC20 } from "../generated/Codex/ERC20" // remove me when we deploy notional
// import { ERC20 } from "../generated/Notional/ERC20";
import { COLLYBUS_ADDRESS, CODEX_ADDRESS, FIAT_ADDRESS, COLLATERAL_AUCTION_ADDRESS } from "./constants";

let codex = Codex.bind(Address.fromString(CODEX_ADDRESS));
let collybus = Collybus.bind(Address.fromString(COLLYBUS_ADDRESS));
let fiat = FIAT.bind(Address.fromString(FIAT_ADDRESS));
let collateralAuction = CollateralAuction.bind(Address.fromString(COLLATERAL_AUCTION_ADDRESS));

export let WAD = BigInt.fromI64(1000000000000000000);
export let BIGINT_ZERO = BigInt.fromI32(0);
export let BIGINT_ONE = BigInt.fromI32(1);
export let ZERO_ADDRESS = Address.fromHexString('0x0000000000000000000000000000000000000000');

export function max(a: BigInt | null, b: BigInt): BigInt {
  if (a == null) return b;
  return a >= b ? a as BigInt : b;
}

export function min(a: BigInt | null, b: BigInt): BigInt {
  if (a == null) return b;
  return a < b ? a as BigInt : b;
}

// Get position from the Codex contract 
export function getCodexPosition(vault: Address, tokenId: BigInt, owner: Address): Codex__positionsResult | null {
  let position = codex.try_positions(vault, tokenId, owner);
  if (!position.reverted) {
    return position.value;
  }
  return null;
}

// Get delegate from the Codex contract 
export function getDelegates(delegator: Address, delegatee: Address): BigInt {
  let hasDelegate = codex.try_delegates(delegator, delegatee);
  if (!hasDelegate.reverted) {
    return hasDelegate.value;
  }
  return BIGINT_ZERO;
}

// Get balance from the Codex contract 
export function getCodexBalance(vault: Address, tokenId: BigInt, owner: Address): BigInt {
  let balance = codex.try_balances(vault, tokenId, owner);
  if (!balance.reverted) {
    return balance.value;
  }
  return BIGINT_ZERO;
}

export function getMaturity(vault: Address, tokenId: BigInt): BigInt | null {
  let iVault = IVault.bind(vault);
  let maturity = iVault.try_maturity(tokenId);
  if (!maturity.reverted) {
    return maturity.value;
  }
  return null;
}

export function getUnderlierToken(vault: Address): Address | null {
  let iVault = IVault.bind(vault);
  let underlierToken = iVault.try_underlierToken();
  if (!underlierToken.reverted) {
    return underlierToken.value;
  }
  return null;
}

// Max LTV or getLiquidationRatio or Collaterization Ratio
export function getCollateralizationRatio(vault: Address): BigInt | null {
  let vaultConfig = collybus.try_vaults(vault);
  if (!vaultConfig.reverted) {
    return vaultConfig.value.value0;
  }
  return null;
}

export function getFaceValue(): BigInt | null {
  let redemptionPrice = collybus.try_redemptionPrice();
  if (!redemptionPrice.reverted) {
    return redemptionPrice.value;
  }
  return null;
}

export function getCurrentValue(
  vault: Address,
  underlierAddress: Address,
  tokenId: BigInt,
  maturity: BigInt,
  net: boolean = false): BigInt | null {
  let currentValue = collybus.try_read(
    vault,
    underlierAddress,
    tokenId,
    maturity,
    net
  );
  if (!currentValue.reverted) {
    return currentValue.value;
  }
  return null;
}

export function getBalance(address: Address): BigInt {
  let balance = fiat.try_balanceOf(address);
  if (!balance.reverted) {
    return balance.value;
  }
  return BIGINT_ZERO;
}

export function getTotalSupply(): BigInt {
  let totalSupply = fiat.try_totalSupply();
  if (!totalSupply.reverted) {
    return totalSupply.value;
  }
  return BIGINT_ZERO;
}

export function getSymbol(address: Address | null): string {
  if (address !== null) {
    let erc20 = ERC20.bind(address);
    let symbol = erc20.try_symbol();

    if (!symbol.reverted) {
      return symbol.value;
    }
  }
  return "";
}

export function getToken(address: Address): Address | null {
  let vault = IVault.bind(address);
  let token = vault.try_token();
  if (!token.reverted) {
    return token.value;
  }
  return null;
}

export function getVaultType(address: Address): string {
  let ivault = IVault.bind(address);
  let type = ivault.try_vaultType();
  if (!type.reverted) {
    return type.value.toHexString();
  }
  return "";
}

export function getUnderlierScale(address: Address): BigInt {
  let ivault = IVault.bind(address);

  let scale = ivault.try_underlierScale();
  if (!scale.reverted) {
    return scale.value;
  }
  return BIGINT_ZERO;
}

export function isActiveAuction(auctionId: BigInt): boolean {
  let list = collateralAuction.try_list();
  if (!list.reverted) {
    return list.value.includes(auctionId);
  }
  return false;
}
