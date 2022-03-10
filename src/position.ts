import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts";
import { ModifyCollateralAndDebt, TransferCollateralAndDebt, ConfiscateCollateralAndDebt } from "../generated/Codex/Codex";
import { CollateralType, ConfiscateCollateralAndDebtAction, ModifyCollateralAndDebtAction, Position, TransferCollateralAndDebtAction, UserPositions, Vault } from "../generated/schema";
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
  let collateralType = createCollateralIfNonExistent(vault, tokenId.toString());
  let userPositions = createUserPositionsIfNonExistent(user);
  let position = createPositionIfNonExistent(
    vault,
    collateralType,
    userPositions,
  );

  createModifyAction(position, event);

  updateUserPositions(userPositions, deltaNormalDebt);

  updateCollateral(collateralType, deltaCollateral);
}

export function createPositionIfNonExistent(
  vault: Vault,
  collateralType: CollateralType,
  userPositions: UserPositions,
  ): Position {
  let userPositionsAddress = userPositions.id;
  let tokenId = collateralType.tokenId;
  let currentPosition = getPosition(changetype<Address>(vault.address!), tokenId!, Address.fromString(userPositionsAddress));
  let id = vault.address!.toHexString() + "-" + tokenId!.toHexString() + "-" + userPositionsAddress;

  let position = Position.load(id);
  if (position == null) {
    position = new Position(id);
    position.vault = vault.id;
    position.vaultName = vault.name;
    position.collateralType = collateralType.id;
    position.userPositions = userPositionsAddress;
    position.owner = Address.fromString(userPositionsAddress);
  }
  position.totalCollateral = currentPosition!.value0;
  position.totalNormalDebt = currentPosition!.value1;
  position.maturity = getMaturity(changetype<Address>(vault.address!), tokenId!);
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

export function createUserPositionsIfNonExistent(owner: Bytes): UserPositions {
  let id = owner.toHexString();
  let userPositions = UserPositions.load(id);

  if (userPositions == null) {
    userPositions = new UserPositions(id);
    userPositions.totalCollateral = BigInt.fromI32(0);
    userPositions.totalFIAT = BigInt.fromI32(0);
    userPositions.owner = owner;
    userPositions.save();
  }
  return userPositions as UserPositions;
}

export function updateUserPositions(userPositions: UserPositions, deltaFiat: BigInt): void {
  userPositions.totalFIAT = userPositions.totalFIAT!.plus(deltaFiat);
  userPositions.save();
}

export function handleTransferCollateralAndDebt(event: TransferCollateralAndDebt): void {
  let vaultAddress = event.params.vault;
  let tokenId = event.params.tokenId;
  let userSrc = event.params.src;
  let userDst = event.params.dst;
  let vault = createVaultIfNonExistent(vaultAddress.toHexString());
  let collateralType = createCollateralIfNonExistent(vault, tokenId.toString());
  let userPositionsSrc = createUserPositionsIfNonExistent(userSrc);
  let userPositionsDst = createUserPositionsIfNonExistent(userDst);
  let positionSrc = createPositionIfNonExistent(
    vault,
    collateralType,
    userPositionsSrc,
  );
  let positionDst = createPositionIfNonExistent(
    vault,
    collateralType,
    userPositionsDst,
  );

  createTransferEvent(positionSrc, event);
  createTransferEvent(positionDst, event);
}

export function handleConfiscateCollateralAndDebt(event: ConfiscateCollateralAndDebt): void {
  let vaultAddress = event.params.vault;
  let tokenId = event.params.tokenId;
  let user = event.params.user;
  let vault = createVaultIfNonExistent(vaultAddress.toHexString());
  let collateralType = createCollateralIfNonExistent(vault, tokenId.toString());
  let userPositions = createUserPositionsIfNonExistent(user);
  let position = createPositionIfNonExistent(
    vault,
    collateralType,
    userPositions,
  );

  createConfiscateEvent(position, event);
}
