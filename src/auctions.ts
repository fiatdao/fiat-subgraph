import { BigInt, Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import { RedoAuction, StartAuction, StopAuction, TakeCollateral, SetParam, CollateralAuction, UpdateAuctionDebtFloor } from "../generated/CollateralAuction/CollateralAuction";
import { Collateral, UserAuction, Vault } from "../generated/schema";
import { createCollateralIfNonExistent } from "./collaterals";
import { createVaultIfNonExistent } from "./vault/vaults";
import { isActiveAuction } from "./utils";

const VAULT_PARAMS = ['multiplier','maxAuctionDuration','maxDiscount'];

export function handleStartAuction(event: StartAuction): void {
  let vault = createVaultIfNonExistent(event.params.vault.toHexString());
  let collateral = createCollateralIfNonExistent(vault, event.params.tokenId.toString());
  createUserAuctionIfNonExistent(
    vault,
    collateral,
    event.params.auctionId,
    event.params.startPrice,
    event.params.debt,
    event.params.collateralToSell,
    event.params.tokenId,
    event.params.user,
    event.params.keeper,
    event.params.tip
  );
}

export function createUserAuctionIfNonExistent(
  vault: Vault,
  collateral: Collateral,
  auctionId: BigInt,
  startPrice: BigInt,
  debt: BigInt,
  collateralToSell: BigInt,
  tokenId: BigInt,
  user: Address,
  keeper: Address,
  tip: BigInt
): UserAuction {

  let userAuction = UserAuction.load(auctionId.toString());
  if (!userAuction) {
    userAuction = new UserAuction(auctionId.toString());
    userAuction.auctionId = auctionId;
    userAuction.startPrice = startPrice;
    userAuction.debt = debt;
    userAuction.collateralToSell = collateralToSell;
    userAuction.vault = vault.id;
    userAuction.vaultName = vault.name;
    userAuction.tokenId = tokenId;
    userAuction.collateral = collateral.id
    userAuction.user = user;
    userAuction.keeper = keeper;
    userAuction.tip = tip;
    userAuction.isActive = true;
    userAuction.save();
  }
  return userAuction as UserAuction;
}

export function handleTakeCollateral(event: TakeCollateral): void {
  let auctionId = event.params.auctionId;
  setAuctionActive(auctionId);

  let userAuction = UserAuction.load(auctionId.toString());
  if (userAuction) {
    userAuction.debt = event.params.debt;
    userAuction.collateralToSell = event.params.collateralToSell;
    userAuction.save();
  }
}

export function handleStopAuction(event: StopAuction): void {
  setAuctionActive(event.params.auctionId);
}

function setAuctionActive(auctionId: BigInt): void {
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
  let auction = createUserAuctionIfNonExistent(
    vault,
    collateral,
    event.params.auctionId,
    event.params.startPrice,
    event.params.debt,
    event.params.collateralToSell,
    event.params.tokenId,
    event.params.user,
    event.params.keeper,
    event.params.tip
  );
  auction.startsAt = event.block.timestamp;
  auction.startPrice = event.params.startPrice;
  auction.keeper = event.params.keeper;
  auction.tip = event.params.tip;
  auction.save();
}

export function handleAuctionSetParam(event: SetParam): void {
  let param = event.params.param.toString();
  if (VAULT_PARAMS.includes(param)) {
    // Skip the selector
    let dataWithoutFunctionSelector = changetype<Bytes>(event.transaction.input.subarray(4));
    let params = ethereum.decode('(address,bytes32,address)', dataWithoutFunctionSelector)!.toTuple();
    let vault = createVaultIfNonExistent(params[0].toAddress().toHexString());

    let collateralAuction = CollateralAuction.bind(event.address);
    let caVault = collateralAuction.try_vaults(params[0].toAddress());
    if (!caVault.reverted) {
      vault.multiplier = caVault.value.value0;
      vault.maxAuctionDuration = caVault.value.value1;
      // TODO - Uncomment this once using CollateralAuction instead of NonLossCollateralAuction
      // vault.maxDiscount = caVault.value.value2;
      vault.save();
    }
  }
}

export function handleUpdateAuctionDebtFloor(event: UpdateAuctionDebtFloor): void {
  let vaultAddress = event.params.vault;
  let vault = createVaultIfNonExistent(vaultAddress.toHexString());
  vault.auctionDebtFloor = event.params.auctionDebtFloor;
  vault.save();
}
