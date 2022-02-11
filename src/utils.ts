import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Codex, Codex__positionsResult } from "../generated/Codex/Codex";
import { Collybus } from "../generated/Codex/Collybus";
import { IVault } from "../generated/Codex/IVault";
import { VaultEPT } from "../generated/Codex/VaultEPT";
import { Fiat } from "../generated/Fiat/Fiat";
import { ERC20 } from "../generated/Notional/ERC20";
import { COLLYBUS_ADDRESS, CODEX_ADDRESS, FIAT_ADDRESS } from "./constants";

let codex = Codex.bind(Address.fromString(CODEX_ADDRESS));
let collybus = Collybus.bind(Address.fromString(COLLYBUS_ADDRESS));
let fiat = Fiat.bind(Address.fromString(FIAT_ADDRESS));

export let BIGINT_ZERO = BigInt.fromI32(0);
export let ZERO_ADDRESS = Address.fromHexString('0x0000000000000000000000000000000000000000');

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

export function getTotalSupply(): BigInt {
  let totalSupply = fiat.try_totalSupply();
  if (!totalSupply.reverted) {
    return totalSupply.value;
  }
  return BIGINT_ZERO;
}

export function getSymbol(address: Address | null): string {
  if (address !== null) {
      let erc20 = ERC20.bind(address!);
      let symbol = erc20.try_symbol();

      if (!symbol.reverted) {
        return symbol.value;
      }
  }
  return "";
}

export function getToken(address: Address): Address | null {
  let vault = VaultEPT.bind(address);
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
