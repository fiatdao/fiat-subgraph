import { BigInt, Address, Bytes, ethereum } from '@graphprotocol/graph-ts';
import {
  RedoAuction,
  StartAuction,
  StopAuction,
  TakeCollateral,
  SetParam,
  CollateralAuction as CollateralAuctionContract,
  UpdateAuctionDebtFloor
} from "../generated/CollateralAuction/CollateralAuction";
import { CollateralType, CollateralAuction, Vault } from "../generated/schema";
import { createCollateralTypeIfNonExistent } from "./collateralType";
import { createVaultIfNonExistent } from "./vault/vaults";
import { isActiveAuction } from "./utils";

const VAULT_PARAMS = ['multiplier', 'maxAuctionDuration', 'maxDiscount'];

export function handleStartAuction(event: StartAuction): void {
  let vault = createVaultIfNonExistent(event.params.vault.toHexString());
  let collateralType = createCollateralTypeIfNonExistent(vault, event.params.tokenId.toString());
  createCollateralAuctionIfNonExistent(
    vault,
    collateralType,
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

export function createCollateralAuctionIfNonExistent(
  vault: Vault,
  collateralType: CollateralType,
  auctionId: BigInt,
  startPrice: BigInt,
  debt: BigInt,
  collateralToSell: BigInt,
  tokenId: BigInt,
  user: Address,
  keeper: Address,
  tip: BigInt
): CollateralAuction {

  let collateralAuction = CollateralAuction.load(auctionId.toString());
  if (!collateralAuction) {
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
    collateralAuction.keeper = keeper;
    collateralAuction.tip = tip;
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
  let vault = createVaultIfNonExistent(event.params.vault.toHexString());
  let collateralType = createCollateralTypeIfNonExistent(vault, event.params.tokenId.toString());
  let auction = createCollateralAuctionIfNonExistent(
    vault,
    collateralType,
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

    let collateralAuction = CollateralAuctionContract.bind(event.address);
    let caVault = collateralAuction.try_vaults(params[0].toAddress());
    if (!caVault.reverted) {
      vault.multiplier = caVault.value.value0;
      vault.maxAuctionDuration = caVault.value.value1;
      // not used by NoLossCollateralAuction
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
