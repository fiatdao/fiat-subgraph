import { Address, BigInt } from "@graphprotocol/graph-ts";
import { CollybusSpot, CollybusDiscountRate } from "../generated/schema";
import { SetParam1, SetParam2, UpdateSpot, UpdateDiscountRate } from "../generated/Codex/Collybus";
import { createVaultIfNonExistent } from "./vault";
import { createCollateralTypeIfNonExistent } from "./collateralType";

export function handleCollybusSetParam1(event: SetParam1): void {
  let vault = createVaultIfNonExistent(event.params.vault);

  if (event.params.param.toString() == "liquidationRatio") {
    vault.collateralizationRatio = event.params.data;
  }
  if (event.params.param.toString() == "defaultRateId") {
    vault.defaultRateId = event.params.data;
  }

  vault.save();
}

export function handleCollybusSetParam2(event: SetParam2): void {
  if (event.params.param.toString() == "rateId") {
    let vault = createVaultIfNonExistent(event.params.vault);
    let collateralType = createCollateralTypeIfNonExistent(vault, event.params.tokenId);
    collateralType.rateId = event.params.data;
    collateralType.save();
  }
}

export function handleCollybusUpdateSpot(event: UpdateSpot): void {
  let collybusSpot = createCollybusSpotIfNonExistent(event.params.token, event.address);
  collybusSpot.spot = event.params.spot;
  collybusSpot.save();
}

export function handleCollybusUpdateDiscountRate(event: UpdateDiscountRate): void {
  let collybusRate = createCollybusDiscountRateIfNonExistent(event.address, event.params.rateId);
  collybusRate.rateId = event.params.rateId;
  collybusRate.discountRate = event.params.rate;
  collybusRate.save();
}

function createCollybusSpotIfNonExistent(token: Address, collybusAddress: Address): CollybusSpot {
  let id = collybusAddress.toHexString() + "-" + token.toHexString();

  let collybusSpot = CollybusSpot.load(id);
  if (collybusSpot == null) {
    collybusSpot = new CollybusSpot(id);
    collybusSpot.token = token;
    collybusSpot.save();
  }

  return collybusSpot as CollybusSpot;
}

function createCollybusDiscountRateIfNonExistent(collybusAddress: Address, rateId: BigInt): CollybusDiscountRate {
  let id = collybusAddress.toHexString() + "-" + rateId.toHexString();

  let collybusRate = CollybusDiscountRate.load(id);
  if (collybusRate == null) {
    collybusRate = new CollybusDiscountRate(id);
    collybusRate.save();
  }

  return collybusRate as CollybusDiscountRate;
}
