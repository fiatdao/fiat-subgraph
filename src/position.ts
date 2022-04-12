import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts";
import {
  ModifyCollateralAndDebt, TransferCollateralAndDebt, ConfiscateCollateralAndDebt
} from "../generated/Codex/Codex";
import {
  CollateralType,
  ConfiscateCollateralAndDebtAction,
  ModifyCollateralAndDebtAction,
  Position,
  TransferCollateralAndDebtAction,
  User,
  Vault 
} from "../generated/schema";
import { createCollateralTypeIfNonExistent } from "./collateralType";
import { getMaturity, getPositionCollateral, getPositionNormalDebt, getCodexBalance, getCredit } from "./utils";
import { createVaultIfNonExistent } from "./vault/vaults";
import { createBalanceIfNotExistent } from "./codex";

export function createUserIfNonExistent(address: Bytes): User {
  let id = address.toHexString();

  let user = User.load(id);
  if (user == null) {
    user = new User(id);
    user.address = address;
    user.credit = BigInt.fromI32(0);
    user.save();
  }

  return user as User;
}

export function createPositionIfNonExistent(
  vault: Vault,
  collateralType: CollateralType,
  user: User,
): Position {
  let id = vault.address!.toHexString() + "-" + collateralType.tokenId!.toHexString() + "-" + user.id;

  let position = Position.load(id);
  if (position == null) {
    position = new Position(id);
    position.vault = vault.id;
    position.vaultName = vault.name;
    position.collateralType = collateralType.id;
    position.users = user.id;
    position.owner = Address.fromString(user.id);
  }
  position.maturity = getMaturity(Address.fromBytes(vault.address!), collateralType.tokenId!);
  position.collateral = getPositionCollateral(Address.fromBytes(vault.address!), collateralType.tokenId!, Address.fromString(user.id));
  position.normalDebt = getPositionNormalDebt(Address.fromBytes(vault.address!), collateralType.tokenId!, Address.fromString(user.id));
  position.save();

  return position as Position;
}

export function handleModifyCollateralAndDebt(event: ModifyCollateralAndDebt): void {
  let vault = createVaultIfNonExistent(event.params.vault.toHexString());
  let collateralType = createCollateralTypeIfNonExistent(vault, event.params.tokenId.toString());

  let positionUser = createUserIfNonExistent(event.params.user);
  positionUser.credit = getCredit(event.params.user);
  positionUser.save();

  let creditorUser = createUserIfNonExistent(event.params.creditor);
  creditorUser.credit = getCredit(event.params.creditor);
  creditorUser.save();

  let positionBalance = createBalanceIfNotExistent(event.params.vault, event.params.tokenId, positionUser);
  positionBalance.balance = getCodexBalance(event.params.vault, event.params.tokenId, event.params.user);
  positionBalance.save();

  let collateralizerUser = createUserIfNonExistent(event.params.creditor);
  let collateralizerBalance = createBalanceIfNotExistent(event.params.vault, event.params.tokenId, collateralizerUser);
  collateralizerBalance.balance = getCodexBalance(event.params.vault, event.params.tokenId, event.params.collateralizer);
  collateralizerBalance.save();

  let position = createPositionIfNonExistent(vault, collateralType, positionUser);
  createModifyAction(position, event);

  collateralType.depositedCollateral = collateralType.depositedCollateral!.plus(event.params.deltaCollateral);
  collateralType.save();
}

export function handleTransferCollateralAndDebt(event: TransferCollateralAndDebt): void {
  let vault = createVaultIfNonExistent(event.params.vault.toHexString());
  let collateralType = createCollateralTypeIfNonExistent(vault, event.params.tokenId.toString());
  
  let srcUser = createUserIfNonExistent(event.params.src);
  let positionSrc = createPositionIfNonExistent(vault, collateralType, srcUser);
  let srcBalance = createBalanceIfNotExistent(event.params.vault, event.params.tokenId, srcUser);
  srcBalance.balance = getCodexBalance(event.params.vault, event.params.tokenId, event.params.src);
  srcBalance.save()

  let dstUser = createUserIfNonExistent(event.params.dst);
  let positionDst = createPositionIfNonExistent(vault, collateralType, dstUser);
  let dstBalance = createBalanceIfNotExistent(event.params.vault, event.params.tokenId, dstUser);
  dstBalance.balance = getCodexBalance(event.params.vault, event.params.tokenId, event.params.dst);
  dstBalance.save()
  
  createTransferEvent(positionSrc, event);
  createTransferEvent(positionDst, event);
}

export function handleConfiscateCollateralAndDebt(event: ConfiscateCollateralAndDebt): void {
  let positionUser = createUserIfNonExistent(event.params.user);
  let positionBalance = createBalanceIfNotExistent(event.params.vault, event.params.tokenId, positionUser);
  positionBalance.balance = getCodexBalance(event.params.vault, event.params.tokenId, event.params.user);
  positionBalance.save();

  let collateralizerUser = createUserIfNonExistent(event.params.collateralizer);
  let collateralizerBalance = createBalanceIfNotExistent(event.params.vault, event.params.tokenId, collateralizerUser);
  collateralizerBalance.balance = getCodexBalance(event.params.vault, event.params.tokenId, event.params.collateralizer);
  collateralizerBalance.save();

  let vault = createVaultIfNonExistent(event.params.vault.toHexString());
  let collateralType = createCollateralTypeIfNonExistent(vault, event.params.tokenId.toString());
  let position = createPositionIfNonExistent(vault, collateralType, positionUser);

  createConfiscateEvent(position, event);
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