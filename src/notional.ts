import { BigInt } from "@graphprotocol/graph-ts";
import { MarketsInitialized, Notional } from "../generated/Notional/Notional";
import { createNotionalCollateralIfNonExistent } from "./collateralType";

export const RATE_PRECISION = 1000000000;
export const BASIS_POINTS = 100000;
export const MAX_TRADED_MARKET_INDEX = 7
export const DAY = 86400;
export const WEEK = DAY * 6;
export const MONTH = DAY * 30;
export const QUARTER = DAY * 90;
export const YEAR = QUARTER * 4;

export function getTimeRef(timestamp: i32): i32 {
  return timestamp - (timestamp % QUARTER);
}

function getTradedMarket(index: i32) : i32 {
  if (index == 1) return QUARTER;
  if (index == 2) return 2 * QUARTER;
  if (index == 3) return YEAR;
  if (index == 4) return 2 * YEAR;
  if (index == 5) return 5 * YEAR;
  if (index == 6) return 10 * YEAR;
  if (index == 7) return 20 * YEAR;

  return 0;
}

function getMarketTenor(maturity: BigInt, blockTime: BigInt): BigInt {
  let tRef = BigInt.fromI32(getTimeRef(blockTime.toI32()));

  for (let i = 1; i <= MAX_TRADED_MARKET_INDEX; i++) {
      let tadeMarket = getTradedMarket(i);
      let marketMaturity = tRef.plus(BigInt.fromI32(tadeMarket));
      if (marketMaturity.equals(maturity)) return BigInt.fromI32(tadeMarket);
  }

  return BigInt.fromI32(0)
}

export function handleMarketsInitialized(event: MarketsInitialized): void {
  let currencyId = event.params.currencyId;
  let tRef = getTimeRef(event.block.timestamp.toI32());
  let notional = Notional.bind(event.address);
  let marketsResult = notional.getActiveMarketsAtBlockTime(currencyId, BigInt.fromI32(tRef));

  for (let i: i32 = 0; i < marketsResult.length; i++) {
    let maturity = marketsResult[i].maturity;
    let tenor = getMarketTenor(maturity, event.block.timestamp);
    let assetType = 1;
    let tokenId = notional.encodeToId(currencyId, maturity, assetType);

    createNotionalCollateralIfNonExistent(notional, tokenId, currencyId, maturity, tenor);
  }
}
