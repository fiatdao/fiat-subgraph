import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts";
import { ModifyCollateralAndDebt, TransferCollateralAndDebt, ConfiscateCollateralAndDebt } from "../generated/Codex/Codex";
import { Position, PositionTransaction, UserPosition } from "../generated/schema";
import { createCollateralIfNonExistent, updateCollateral } from "./collaterals";
import { getMaturity, getPosition, min } from "./utils";

const MODIFY = "MODIFY";
const TRANSFER = "TRANSFER";
const CONFISCATE = "CONFISCATE";

export function handleModifyCollateralAndDebt(event: ModifyCollateralAndDebt): void {
  let vault = event.params.vault;
  let tokenId = event.params.tokenId;
  let user = event.params.user;
  // let collateralizer = event.params.collateralizer;
  // let creditor = event.params.creditor;
  let deltaCollateral = event.params.deltaCollateral;
  let deltaNormalDebt = event.params.deltaNormalDebt;

  let userPosition = createUserPositionIfNonExistent(user);
  let position = createPositionIfNonExistent(
    vault,
    tokenId,
    userPosition,
  );

  let id = event.transaction.hash;
  let type = MODIFY;

  let tx = createPositionTransaction(id, type, position, deltaCollateral, deltaNormalDebt);

  updateUserPosition(userPosition, position, tx);

  updateCollateral(vault.toHexString(), tokenId.toString(), tx.deltaCollateral);
}

export function createPositionIfNonExistent(
  vault: Bytes,
  collateralId: BigInt,
  userPosition: UserPosition,
  ): Position {
  let vaultAddress = vault.toHexString();
  let userPositionAddress = userPosition.id;
  let currentPosition = getPosition(vault as Address, collateralId, Address.fromString(userPositionAddress));
  let id = vaultAddress + "-" + collateralId.toHexString() + "-" + userPositionAddress;

  let position = Position.load(id);
  if (position == null) {
    position = new Position(id);
    let collateral = createCollateralIfNonExistent(vault.toHexString(), collateralId.toString());
    position.vault = vault.toHexString();
    position.collateral = collateral.id;
    position.userPosition = userPositionAddress;
  }
  position.totalCollateral = currentPosition.value0;
  position.totalNormalDebt = currentPosition.value1;
  position.maturity = getMaturity(vault as Address, collateralId);
  position.save();
  return position as Position;
}

export function createPositionTransaction(
  transactionHash: Bytes,
  type: string,
  position: Position,
  deltaCollateral: BigInt,
  deltaNormalDebt: BigInt,
  ): PositionTransaction {
  let id = transactionHash.toHexString();
  let positionTransaction = new PositionTransaction(id);

  positionTransaction.type = type;
  positionTransaction.position = position.id;
  positionTransaction.collateral = position.totalCollateral;
  positionTransaction.deltaCollateral = deltaCollateral;
  positionTransaction.normalDebt = position.totalNormalDebt;
  positionTransaction.deltaNormalDebt = deltaNormalDebt;
  positionTransaction.save();
  return positionTransaction as PositionTransaction;
}

export function createUserPositionIfNonExistent(userAddress: Bytes): UserPosition {
  let id = userAddress.toHexString();
  let userPosition = UserPosition.load(id);

  if (userPosition == null) {
    userPosition = new UserPosition(id);
    userPosition.totalCollateral = BigInt.fromI32(0);
    userPosition.totalFIAT = BigInt.fromI32(0);
    userPosition.proxyAddress = userAddress;
    userPosition.save();
  }
  return userPosition as UserPosition;
}

export function updateUserPosition(
  userPosition: UserPosition,
  position: Position,
  positionTransaction: PositionTransaction): void {
  userPosition.totalCollateral = userPosition.totalCollateral.plus(positionTransaction.deltaCollateral);
  userPosition.totalFIAT = userPosition.totalFIAT.plus(positionTransaction.deltaNormalDebt);
  if (position.maturity) {
    userPosition.nearestMaturity = min(userPosition.nearestMaturity, position.maturity!);
  }
  userPosition.save();
}

export function handleTransferCollateralAndDebt(event: TransferCollateralAndDebt): void {
  let vault = event.params.vault;
  let collateral = event.params.tokenId;
  let userSrc = event.params.src;
  let userDst = event.params.dst;
  let deltaCollateral = event.params.deltaCollateral;
  let deltaNormalDebt = event.params.deltaNormalDebt;

  let userPositionSrc = createUserPositionIfNonExistent(userSrc);
  let userPositionDst = createUserPositionIfNonExistent(userDst);

  let positionSrc = createPositionIfNonExistent(
    vault,
    collateral,
    userPositionSrc,
  );
  let positionDst = createPositionIfNonExistent(
    vault,
    collateral,
    userPositionDst,
  );

  let id = event.transaction.hash;
  let type = TRANSFER;
  createPositionTransaction(id, type, positionSrc, deltaCollateral, deltaNormalDebt);
  createPositionTransaction(id, type, positionDst, deltaCollateral, deltaNormalDebt);
}

export function handleConfiscateCollateralAndDebt(event: ConfiscateCollateralAndDebt): void {
  let vault = event.params.vault;
  let collateral = event.params.tokenId;
  let user = event.params.user;
  // let collateralizer = event.params.collateralizer;
  // let creditor = event.params.creditor;
  let deltaCollateral = event.params.deltaCollateral;
  let deltaNormalDebt = event.params.deltaNormalDebt;

  let userPosition = createUserPositionIfNonExistent(user);

  let position = createPositionIfNonExistent(
    vault,
    collateral,
    userPosition,
  );

  let id = event.transaction.hash;
  let type = CONFISCATE;

  createPositionTransaction(id, type, position, deltaCollateral, deltaNormalDebt);
}
