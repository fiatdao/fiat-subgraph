import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts";
import { ModifyCollateralAndDebt, TransferCollateralAndDebt, ConfiscateCollateralAndDebt } from "../generated/Codex/Codex";
import { CollateralType, ConfiscateCollateralAndDebtAction, ModifyCollateralAndDebtAction, Position, TransferCollateralAndDebtAction, User, Vault } from "../generated/schema";
import { createCollateralIfNonExistent, updateCollateral } from "./collateralType";
import { getMaturity, getCodexPosition, getCodexBalance } from "./utils";
import { createVaultIfNonExistent } from "./vault/vaults";
import { createBalanceIfNotExistent } from "./codex";
import { log } from '@graphprotocol/graph-ts'

export function handleModifyCollateralAndDebt(event: ModifyCollateralAndDebt): void {
  let vaultAddress = event.params.vault;
  let tokenId = event.params.tokenId;
  let user = event.params.user;
  let collateralizer = event.params.collateralizer;
  // let creditor = event.params.creditor;
  let deltaCollateral = event.params.deltaCollateral;
  let deltaNormalDebt = event.params.deltaNormalDebt;
  log.debug("Position1: " + vaultAddress.toHexString(), [])

  let vault = createVaultIfNonExistent(vaultAddress.toHexString());
  let collateralType = createCollateralIfNonExistent(vault, tokenId.toString());
  let userEntity = createUserIfNonExistent(user);
  let position = createPositionIfNonExistent(
    vault,
    collateralType,
    userEntity,
  );

  let balance = getCodexBalance(vaultAddress, tokenId, collateralizer);
  let balanceEntity = createBalanceIfNotExistent(vaultAddress, tokenId, collateralizer);
  balanceEntity.balance = balance;
  balanceEntity.save();

  createModifyAction(position, event);

  updateUser(userEntity, deltaNormalDebt);

  userEntity.totalNormalDebt = userEntity.totalNormalDebt!.plus(position.normalDebt);
  userEntity.save();

  updateCollateral(collateralType, deltaCollateral);
}

export function createPositionIfNonExistent(
  vault: Vault,
  collateralType: CollateralType,
  user: User,
): Position {
  let userAddress = user.id;
  let tokenId = collateralType.tokenId;
  let currentPosition = getCodexPosition(changetype<Address>(vault.address!), tokenId!, Address.fromString(userAddress));
  let id = vault.address!.toHexString() + "-" + tokenId!.toHexString() + "-" + userAddress;

  let position = Position.load(id);
  if (position == null) {
    position = new Position(id);
    position.vault = vault.id;
    position.vaultName = vault.name;
    position.collateralType = collateralType.id;
    position.users = userAddress;
    position.owner = Address.fromString(userAddress);
  }
  position.collateral = currentPosition!.value0;
  position.normalDebt = currentPosition!.value1;
  position.maturity = getMaturity(changetype<Address>(vault.address!), tokenId!);
  position.save();
  return position as Position;
}

export function createModifyAction(position: Position, event: ModifyCollateralAndDebt): void {
  let id = event.transaction.hash.toHexString();
  let modifyAction = new ModifyCollateralAndDebtAction(id);
  modifyAction.vault = position.vault;
  modifyAction.vaultName = position.vaultName;
  modifyAction.tokenId = event.params.tokenId;
  modifyAction.user = event.params.user;
  modifyAction.collateralizer = event.params.collateralizer;
  modifyAction.creditor = event.params.creditor;
  modifyAction.deltaCollateral = event.params.deltaCollateral;
  modifyAction.deltaNormalDebt = event.params.deltaNormalDebt;

  modifyAction.normalDebt = position.normalDebt;
  modifyAction.collateral = position.collateral;
  modifyAction.position = position.id;
  modifyAction.transactionHash = event.transaction.hash;
  modifyAction.timestamp = event.block.timestamp;
  modifyAction.save();
}

export function createTransferEvent(position: Position, event: TransferCollateralAndDebt): void {
  let id = event.transaction.hash.toHexString();
  let transferAction = new TransferCollateralAndDebtAction(id);
  transferAction.vault = position.vault;
  transferAction.vaultName = position.vaultName;
  transferAction.tokenId = event.params.tokenId;
  transferAction.user = event.params.src;
  transferAction.userSrc = event.params.src;
  transferAction.userDst = event.params.dst;
  transferAction.deltaCollateral = event.params.deltaCollateral;
  transferAction.deltaNormalDebt = event.params.deltaNormalDebt;

  transferAction.normalDebt = position.normalDebt;
  transferAction.collateral = position.collateral;
  transferAction.position = position.id;
  transferAction.transactionHash = event.transaction.hash;
  transferAction.timestamp = event.block.timestamp;
  transferAction.save();
}

export function createConfiscateEvent(position: Position, event: ConfiscateCollateralAndDebt): void {
  let id = event.transaction.hash.toHexString();
  let confiscateAction = new ConfiscateCollateralAndDebtAction(id);
  confiscateAction.vault = position.vault;
  confiscateAction.vaultName = position.vaultName;
  confiscateAction.tokenId = event.params.tokenId;
  confiscateAction.user = event.params.user;
  confiscateAction.collateralizer = event.params.collateralizer;
  confiscateAction.debtor = event.params.debtor;
  confiscateAction.deltaCollateral = event.params.deltaCollateral;
  confiscateAction.deltaNormalDebt = event.params.deltaNormalDebt;

  confiscateAction.normalDebt = position.normalDebt;
  confiscateAction.collateral = position.collateral;
  confiscateAction.position = position.id;
  confiscateAction.transactionHash = event.transaction.hash;
  confiscateAction.timestamp = event.block.timestamp;
  confiscateAction.save();
}

export function createUserIfNonExistent(owner: Bytes): User {
  let id = owner.toHexString();
  let user = User.load(id);

  if (user == null) {
    user = new User(id);
    user.totalCollateral = BigInt.fromI32(0);
    user.totalCredit = BigInt.fromI32(0);
    user.totalNormalDebt = BigInt.fromI32(0);
    user.owner = owner;
    user.save();
  }
  return user as User;
}

export function updateUser(user: User, deltaFIAT: BigInt): void {
  user.totalCredit = user.totalCredit!.plus(deltaFIAT);
  user.save();
}

export function handleTransferCollateralAndDebt(event: TransferCollateralAndDebt): void {
  let vaultAddress = event.params.vault;
  let tokenId = event.params.tokenId;
  let userSrc = event.params.src;
  let userDst = event.params.dst;
  log.debug("Position2: " + vaultAddress.toHexString(), [])

  let vault = createVaultIfNonExistent(vaultAddress.toHexString());
  let collateralType = createCollateralIfNonExistent(vault, tokenId.toString());
  let userSrcEntity = createUserIfNonExistent(userSrc);
  let userDstEntity = createUserIfNonExistent(userDst);
  let positionSrc = createPositionIfNonExistent(
    vault,
    collateralType,
    userSrcEntity,
  );
  let positionDst = createPositionIfNonExistent(
    vault,
    collateralType,
    userDstEntity,
  );

  userSrcEntity.totalNormalDebt = userSrcEntity.totalNormalDebt!.plus(positionSrc.normalDebt);
  userDstEntity.totalNormalDebt = userDstEntity.totalNormalDebt!.plus(positionDst.normalDebt);

  userSrcEntity.save();
  userDstEntity.save();

  createTransferEvent(positionSrc, event);
  createTransferEvent(positionDst, event);
}

export function handleConfiscateCollateralAndDebt(event: ConfiscateCollateralAndDebt): void {
  let vaultAddress = event.params.vault;
  let tokenId = event.params.tokenId;
  let user = event.params.user;
  let collateralizer = event.params.collateralizer;
  log.debug("Position3: " + vaultAddress.toHexString(), [])

  let vault = createVaultIfNonExistent(vaultAddress.toHexString());
  let collateralType = createCollateralIfNonExistent(vault, tokenId.toString());
  let userEntity = createUserIfNonExistent(user);
  let position = createPositionIfNonExistent(
    vault,
    collateralType,
    userEntity,
  );

  userEntity.totalNormalDebt = userEntity.totalNormalDebt!.plus(position.normalDebt);
  userEntity.save();

  createConfiscateEvent(position, event);

  let balance = getCodexBalance(vaultAddress, tokenId, collateralizer);
  let balanceEntity = createBalanceIfNotExistent(vaultAddress, tokenId, collateralizer);
  balanceEntity.balance = balance;
  balanceEntity.save();
}