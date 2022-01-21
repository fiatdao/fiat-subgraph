import { BigInt } from "@graphprotocol/graph-ts";

export function max(a: BigInt | null, b: BigInt): BigInt {
  if (a == null) return b;
  return a >= b ? a as BigInt : b;
}
