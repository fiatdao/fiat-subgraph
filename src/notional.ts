import { BigInt } from "@graphprotocol/graph-ts";
import { MarketsInitialized, Notional } from "../generated/Notional/Notional";
import { createNotionalCollateralIfNonExistent } from "./collaterals";

export const RATE_PRECISION = 1000000000;
export const BASIS_POINTS = 100000;
export const DAY = 86400;
export const WEEK = DAY * 6;
export const MONTH = DAY * 30;
export const QUARTER = DAY * 90;
export const YEAR = QUARTER * 4;

export function getTimeRef(timestamp: i32): i32 {
  return timestamp - (timestamp % QUARTER);
}

export function handleMarketsInitialized(event: MarketsInitialized): void {
  let currencyId = event.params.currencyId;
  let tRef = getTimeRef(event.block.timestamp.toI32());
  let notional = Notional.bind(event.address);
  let marketsResult = notional.getActiveMarketsAtBlockTime(currencyId, BigInt.fromI32(tRef));

  for (let i: i32 = 0; i < marketsResult.length; i++) {
    let maturity = marketsResult[i].maturity;
    createNotionalCollateralIfNonExistent(notional, currencyId, maturity);
  }
}
