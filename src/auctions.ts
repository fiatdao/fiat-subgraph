import { BigInt, Address } from '@graphprotocol/graph-ts';
import {
  RedoAuction, StartAuction, StopAuction, TakeCollateral, SetParam1, UpdateAuctionDebtFloor
} from "../generated/CollateralAuction/CollateralAuction";
import { CollateralType, CollateralAuction, Vault } from "../generated/schema";
import { createCollateralTypeIfNonExistent } from "./collateralType";
import { createVaultIfNonExistent } from "./vault";
import { isActiveAuction } from "./utils";

export function handleStartAuction(event: StartAuction): void {
  let vault = createVaultIfNonExistent(event.params.vault);
  let collateralType = createCollateralTypeIfNonExistent(vault, event.params.tokenId);
  createCollateralAuctionIfNonExistent(
    vault,
    collateralType,
    event.params.auctionId,
    event.params.startPrice,
    event.params.debt,
    event.params.collateralToSell,
    event.params.tokenId,
    event.params.user
  );
}

export function createCollateralAuctionIfNonExistent(
  vault: Vault,
  collateralType: CollateralType,
  auctionId: BigInt,
  startPrice: BigInt,
  debt: BigInt,
  collateralToSell: BigInt,
  tokenId: BigInt,
  user: Address
): CollateralAuction {

  let collateralAuction = CollateralAuction.load(auctionId.toString());
  if (collateralAuction == null) {
    collateralAuction = new CollateralAuction(auctionId.toString());
    collateralAuction.auctionId = auctionId;
    collateralAuction.startPrice = startPrice;
    collateralAuction.debt = debt;
    collateralAuction.collateralToSell = collateralToSell;
    collateralAuction.vault = vault.id;
    collateralAuction.vaultName = vault.name;
    collateralAuction.tokenId = tokenId;
    collateralAuction.collateralType = collateralType.id;
    collateralAuction.user = user;
    collateralAuction.isActive = true;
    collateralAuction.save();
  }
  return collateralAuction as CollateralAuction;
}

export function handleTakeCollateral(event: TakeCollateral): void {
  let auctionId = event.params.auctionId;
  setAuctionActive(auctionId);

  let collateralAuction = CollateralAuction.load(auctionId.toString());
  if (collateralAuction) {
    collateralAuction.debt = event.params.debt;
    collateralAuction.collateralToSell = event.params.collateralToSell;
    collateralAuction.save();
  }
}

export function handleStopAuction(event: StopAuction): void {
  setAuctionActive(event.params.auctionId);
}

function setAuctionActive(auctionId: BigInt): void {
  let collateralAuction = CollateralAuction.load(auctionId.toString());
  if (collateralAuction) {
    collateralAuction.isActive = isActiveAuction(auctionId);
    collateralAuction.save();
  }
}

// this events modifies the following properties: startsAt, startPrice, keeper, tip
export function handleRedoAuction(event: RedoAuction): void {
  let vault = createVaultIfNonExistent(event.params.vault);
  let collateralType = createCollateralTypeIfNonExistent(vault, event.params.tokenId);
  let auction = createCollateralAuctionIfNonExistent(
    vault,
    collateralType,
    event.params.auctionId,
    event.params.startPrice,
    event.params.debt,
    event.params.collateralToSell,
    event.params.tokenId,
    event.params.user
  );
  auction.startsAt = event.block.timestamp;
  auction.startPrice = event.params.startPrice;
  auction.save();
}

export function handleCollateralAuctionSetParam(event: SetParam1): void {
  let vault = createVaultIfNonExistent(event.params.vault);
  if (event.params.param.toString() == "multiplier") {
    vault.multiplier = event.params.data;
  }
  if (event.params.param.toString() == "maxAuctionDuration") {
    vault.maxAuctionDuration = event.params.data;
  }
  if (event.params.param.toString() == "maxDiscount") {
    vault.maxDiscount = event.params.data;
  }
  vault.save();
}

export function handleUpdateAuctionDebtFloor(event: UpdateAuctionDebtFloor): void {
  let vault = createVaultIfNonExistent(event.params.vault);
  vault.auctionDebtFloor = event.params.auctionDebtFloor;
  vault.save();
}
