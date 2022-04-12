import { BigInt, Address } from '@graphprotocol/graph-ts';
import {
  CollateralAuction as CollateralAuctionContract,
  RedoAuction, StartAuction, StopAuction, TakeCollateral, SetParam1, UpdateAuctionDebtFloor
} from "../generated/CollateralAuction/CollateralAuction";
import { CollateralAuction } from "../generated/schema";
import { createCollateralTypeIfNonExistent } from "./collateralType";
import { createVaultIfNonExistent } from "./vault";
import { createUserIfNonExistent } from "./user";

export function handleStartAuction(event: StartAuction): void {
  let vault = createVaultIfNonExistent(event.params.vault);
  let collateralType = createCollateralTypeIfNonExistent(vault, event.params.tokenId);
  let collateralAuction = createCollateralAuctionIfNonExistent(event.params.auctionId);
  collateralAuction.vault = vault.id;
  collateralAuction.vaultName = vault.name;
  collateralAuction.tokenId = event.params.tokenId;
  collateralAuction.collateralType = collateralType.id;
  collateralAuction.user = createUserIfNonExistent(event.params.user).id;
  collateralAuction.startPrice = event.params.startPrice;
  collateralAuction.startsAt = event.block.timestamp;
  collateralAuction.debt = event.params.debt;
  collateralAuction.collateralToSell = event.params.collateralToSell;
  collateralAuction.save();

  setAuctionActive(event.address, event.params.auctionId);
}

export function handleTakeCollateral(event: TakeCollateral): void {
  let collateralAuction = createCollateralAuctionIfNonExistent(event.params.auctionId);
  collateralAuction.debt = event.params.debt;
  collateralAuction.collateralToSell = event.params.collateralToSell;
  collateralAuction.save();

  setAuctionActive(event.address, event.params.auctionId);
}

function setAuctionActive(collateralAuctionAddress: Address, auctionId: BigInt): void {
  let collateralAuctionContract = CollateralAuctionContract.bind(collateralAuctionAddress);
  let collateralAuction = createCollateralAuctionIfNonExistent(auctionId);
  collateralAuction.isActive = collateralAuctionContract.list().includes(auctionId);
  collateralAuction.save();
}

// this events modifies the following properties: startsAt, startPrice, keeper, tip
export function handleRedoAuction(event: RedoAuction): void {
  let vault = createVaultIfNonExistent(event.params.vault);
  let collateralType = createCollateralTypeIfNonExistent(vault, event.params.tokenId);
  let collateralAuction = createCollateralAuctionIfNonExistent(event.params.auctionId);
  collateralAuction.vault = vault.id;
  collateralAuction.vaultName = vault.name;
  collateralAuction.tokenId = event.params.tokenId;
  collateralAuction.collateralType = collateralType.id;
  collateralAuction.user = createUserIfNonExistent(event.params.user).id;
  collateralAuction.startPrice = event.params.startPrice;
  collateralAuction.startsAt = event.block.timestamp;
  collateralAuction.debt = event.params.debt;
  collateralAuction.collateralToSell = event.params.collateralToSell;
  collateralAuction.save();

  setAuctionActive(event.address, event.params.auctionId);
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

export function handleStopAuction(event: StopAuction): void {
  setAuctionActive(event.address, event.params.auctionId);
}

export function createCollateralAuctionIfNonExistent(auctionId: BigInt): CollateralAuction {
  let collateralAuction = CollateralAuction.load(auctionId.toString());
  if (collateralAuction == null) {
    collateralAuction = new CollateralAuction(auctionId.toString());
    collateralAuction.auctionId = auctionId;
    collateralAuction.save();
  }
  return collateralAuction as CollateralAuction;
}