import { StartAuction, StartAuction__Params } from "../generated/CollateralAuction/CollateralAuction";
import { Collateral, UserAuction, Vault } from "../generated/schema";
import { createCollateralIfNonExistent } from "./collaterals";
import { createVaultIfNonExistent } from "./vault/vaults";

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
    userAuction.tokenId = params.tokenId;
    userAuction.collateral = collateral.id
    userAuction.user = params.user;
    userAuction.keeper = params.keeper;
    userAuction.tip = params.tip;
    userAuction.save();
  }
  return userAuction as UserAuction;
}
