import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Codex, Codex__positionsResult } from "../generated/Codex/Codex";
import { Collybus } from "../generated/Codex/Collybus";
import { IVault } from "../generated/Codex/IVault";
import { COLLYBUS_ADDRESS, CODEX_ADDRESS } from "./constants";

let codex = Codex.bind(Address.fromString(CODEX_ADDRESS));
let collybus = Collybus.bind(Address.fromString(COLLYBUS_ADDRESS));

export function max(a: BigInt | null, b: BigInt): BigInt {
  if (a == null) return b;
  return a >= b ? a as BigInt : b;
}

export function min(a: BigInt | null, b: BigInt): BigInt {
  if (a == null) return b;
  return a < b ? a as BigInt : b;
}

export function getPosition(vault: Address, tokenId: BigInt, userAddress: Address): Codex__positionsResult {
  let position = codex.try_positions(vault, tokenId, userAddress);
  if (!position.reverted) {
    return position.value;
  }
  return null;
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
export function getCollaterizationRatio(vault: Address): BigInt | null {
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
  net: boolean=false): BigInt | null {
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
