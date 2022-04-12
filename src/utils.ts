import { Address, BigInt } from "@graphprotocol/graph-ts";

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
