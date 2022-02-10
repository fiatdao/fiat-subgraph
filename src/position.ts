import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts";
import { ModifyCollateralAndDebt, TransferCollateralAndDebt, ConfiscateCollateralAndDebt } from "../generated/Codex/Codex";
import { Collateral, ConfiscateCollateralAndDebtAction, ModifyCollateralAndDebtAction, Position, TransferCollateralAndDebtAction, UserPosition, Vault } from "../generated/schema";
import { createCollateralIfNonExistent, updateCollateral } from "./collaterals";
import { getMaturity, getPosition } from "./utils";
import { createVaultIfNonExistent } from "./vault/vaults";

export function handleModifyCollateralAndDebt(event: ModifyCollateralAndDebt): void {
  let vaultAddress = event.params.vault;
  let tokenId = event.params.tokenId;
  let user = event.params.user;
  // let collateralizer = event.params.collateralizer;
  // let creditor = event.params.creditor;
  let deltaCollateral = event.params.deltaCollateral;
  let deltaNormalDebt = event.params.deltaNormalDebt;
  let vault = createVaultIfNonExistent(vaultAddress.toHexString());
  let collateral = createCollateralIfNonExistent(vault, tokenId.toString());
  let userPosition = createUserPositionIfNonExistent(user);
  let position = createPositionIfNonExistent(
    vault,
    collateral,
    userPosition,
  );

  createModifyAction(position, event!);

  updateUserPosition(userPosition, deltaNormalDebt);

  updateCollateral(collateral, deltaCollateral);
}

export function createPositionIfNonExistent(
  vault: Vault,
  collateral: Collateral,
  userPosition: UserPosition,
  ): Position {
  let userPositionAddress = userPosition.id;
  let tokenId = collateral.tokenId;
  let currentPosition = getPosition(vault.address as Address, tokenId!, Address.fromString(userPositionAddress));
  let id = vault.address.toHexString() + "-" + tokenId.toHexString() + "-" + userPositionAddress;

  let position = Position.load(id);
  if (position == null) {
    position = new Position(id);
    position.vault = vault.id;
    position.vaultName = vault.name;
    position.collateral = collateral.id;
    position.userPosition = userPositionAddress;
    position.userAddress = Address.fromString(userPositionAddress);
  }
  position.totalCollateral = currentPosition.value0;
  position.totalNormalDebt = currentPosition.value1;
  position.maturity = getMaturity(vault.address as Address, tokenId!);
  position.save();
  return position as Position;
}

export function createModifyAction(position: Position, event: ModifyCollateralAndDebt): void {
  let id = event.transaction.hash.toHexString();
  let modifyAction = new ModifyCollateralAndDebtAction(id);
  modifyAction.vault = event.params.vault;
  modifyAction.vaultName = position.vaultName;
  modifyAction.tokenId = event.params.tokenId;
  modifyAction.user = event.params.user;
  modifyAction.collateralizer = event.params.collateralizer;
  modifyAction.creditor = event.params.creditor;
  modifyAction.deltaCollateral = event.params.deltaCollateral;
  modifyAction.deltaNormalDebt = event.params.deltaNormalDebt;

  modifyAction.normalDebt = position.totalNormalDebt;
  modifyAction.collateral = position.totalCollateral;
  modifyAction.position = position.id;
  modifyAction.transactionHash = event.transaction.hash;
  modifyAction.save();
}

export function createTransferEvent(position: Position, event: TransferCollateralAndDebt): void {
  let id = event.transaction.hash.toHexString();
  let transferAction = new TransferCollateralAndDebtAction(id);
  transferAction.vault = event.params.vault;
  transferAction.vaultName = position.vaultName;
  transferAction.tokenId = event.params.tokenId;
  transferAction.user = event.params.src;
  transferAction.userSrc = event.params.src;
  transferAction.userDst = event.params.dst;
  transferAction.deltaCollateral = event.params.deltaCollateral;
  transferAction.deltaNormalDebt = event.params.deltaNormalDebt;

  transferAction.normalDebt = position.totalNormalDebt;
  transferAction.collateral = position.totalCollateral;
  transferAction.position = position.id;
  transferAction.transactionHash = event.transaction.hash;
  transferAction.save();
}

export function createConfiscateEvent(position: Position, event: ConfiscateCollateralAndDebt): void {
  let id = event.transaction.hash.toHexString();
  let confiscateAction = new ConfiscateCollateralAndDebtAction(id);
  confiscateAction.vault = event.params.vault;
  confiscateAction.vaultName = position.vaultName;
  confiscateAction.tokenId = event.params.tokenId;
  confiscateAction.user = event.params.user;
  confiscateAction.collateralizer = event.params.collateralizer;
  confiscateAction.debtor = event.params.debtor;
  confiscateAction.deltaCollateral = event.params.deltaCollateral;
  confiscateAction.deltaNormalDebt = event.params.deltaNormalDebt;

  confiscateAction.normalDebt = position.totalNormalDebt;
  confiscateAction.collateral = position.totalCollateral;
  confiscateAction.position = position.id;
  confiscateAction.transactionHash = event.transaction.hash;
  confiscateAction.save();
}

export function createUserPositionIfNonExistent(userAddress: Bytes): UserPosition {
  let id = userAddress.toHexString();
  let userPosition = UserPosition.load(id);

  if (userPosition == null) {
    userPosition = new UserPosition(id);
    userPosition.totalCollateral = BigInt.fromI32(0);
    userPosition.totalFIAT = BigInt.fromI32(0);
    userPosition.userAddress = userAddress;
    userPosition.save();
  }
  return userPosition as UserPosition;
}

export function updateUserPosition(userPosition: UserPosition, deltaFiat: BigInt): void {
  userPosition.totalFIAT = userPosition.totalFIAT.plus(deltaFiat);
  userPosition.save();
}

export function handleTransferCollateralAndDebt(event: TransferCollateralAndDebt): void {
  let vaultAddress = event.params.vault;
  let tokenId = event.params.tokenId;
  let userSrc = event.params.src;
  let userDst = event.params.dst;
  let vault = createVaultIfNonExistent(vaultAddress.toHexString());
  let collateral = createCollateralIfNonExistent(vault, tokenId.toString());
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

  createTransferEvent(positionSrc, event);
  createTransferEvent(positionDst, event);
}

export function handleConfiscateCollateralAndDebt(event: ConfiscateCollateralAndDebt): void {
  let vaultAddress = event.params.vault;
  let tokenId = event.params.tokenId;
  let user = event.params.user;
  let vault = createVaultIfNonExistent(vaultAddress.toHexString());
  let collateral = createCollateralIfNonExistent(vault, tokenId.toString());
  let userPosition = createUserPositionIfNonExistent(user);
  let position = createPositionIfNonExistent(
    vault,
    collateral,
    userPosition,
  );

  createConfiscateEvent(position, event);
}
