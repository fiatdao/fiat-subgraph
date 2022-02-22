import { RedoAuction, RedoAuction__Params, StartAuction, StartAuction__Params, StopAuction, TakeCollateral } from "../generated/CollateralAuction/CollateralAuction";
import { Collateral, UserAuction, Vault } from "../generated/schema";
import { createCollateralIfNonExistent } from "./collaterals";
import { createVaultIfNonExistent } from "./vault/vaults";
import { isActiveAuction } from "./utils";

export function handleStartAuction(event: StartAuction): void {
  let vault = createVaultIfNonExistent(event.params.vault.toHexString());
  let collateral = createCollateralIfNonExistent(vault, event.params.tokenId.toString());
  createUserAuctionIfNonExistent(vault, collateral, event.params);
}

export function createUserAuctionIfNonExistent(vault: Vault, collateral: Collateral, params: StartAuction__Params): UserAuction {
  let auctionId = params.auctionId;
  let userAuction = UserAuction.load(auctionId.toString());
  if (!userAuction) {
    userAuction = new UserAuction(auctionId.toString());
    userAuction.auctionId = auctionId;
    userAuction.startPrice = params.startPrice;
    userAuction.debt = params.debt;
    userAuction.collateralToSell = params.collateralToSell;
    userAuction.vault = vault.id;
    userAuction.vaultName = vault.name;
    userAuction.tokenId = params.tokenId;
    userAuction.collateral = collateral.id
    userAuction.user = params.user;
    userAuction.keeper = params.keeper;
    userAuction.tip = params.tip;
    userAuction.isActive = true;
    userAuction.save();
  }
  return userAuction as UserAuction;
}

export function handleTakeCollateral(event: TakeCollateral): void {
  let auctionId = event.params.auctionId;
  let userAuction = UserAuction.load(auctionId.toString());
  if (userAuction) {
    userAuction.isActive = isActiveAuction(auctionId);
    userAuction.save();
  }
}

export function handleStopAuction(event: StopAuction): void {
  let auctionId = event.params.auctionId;
  let userAuction = UserAuction.load(auctionId.toString());
  if (userAuction) {
    userAuction.isActive = isActiveAuction(auctionId);
    userAuction.save();
  }
}

// this events modifies the following properties: startsAt, startPrice, keeper, tip
export function handleRedoAuction(event: RedoAuction): void {
  let vault = createVaultIfNonExistent(event.params.vault.toHexString());
  let collateral = createCollateralIfNonExistent(vault, event.params.tokenId.toString());
  let auction = createUserAuctionIfNonExistent(vault, collateral, event.params as StartAuction__Params);
  auction.startsAt = event.block.timestamp;
  auction.startPrice = event.params.startPrice;
  auction.keeper = event.params.keeper;
  auction.tip = event.params.tip;
  auction.save();
}
