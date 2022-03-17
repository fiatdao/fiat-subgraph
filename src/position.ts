import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts";
import { ModifyCollateralAndDebt, TransferCollateralAndDebt, ConfiscateCollateralAndDebt, GrantDelegate, RevokeDelegate, Lock, ModifyBalance, TransferBalance } from "../generated/Codex/Codex";
import { CollateralType, ConfiscateCollateralAndDebtAction, ModifyCollateralAndDebtAction, Position, TransferCollateralAndDebtAction, UserPositions, Vault, Delegate, IsCodexAlive, CodexBalance } from "../generated/schema";
import { createCollateralIfNonExistent, updateCollateral } from "./collaterals";
import { getMaturity, getCodexPosition, getCodexBalance, getDelegates, BIGINT_ZERO } from "./utils";
import { createVaultIfNonExistent } from "./vault/vaults";

export function handleModifyCollateralAndDebt(event: ModifyCollateralAndDebt): void {
  let vaultAddress = event.params.vault;
  let tokenId = event.params.tokenId;
  let user = event.params.user;
  let collateralizer = event.params.collateralizer;
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
  let balance = getCodexBalance(vaultAddress, tokenId, collateralizer);
  let balanceEntity = createBalanceIfNotExistent(vaultAddress, tokenId, collateralizer);
  balanceEntity.balance = balance;
  balanceEntity.save();

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
  let currentPosition = getCodexPosition(changetype<Address>(vault.address!), tokenId!, Address.fromString(userPositionsAddress));
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
  let collateralizer = event.params.collateralizer;
  let vault = createVaultIfNonExistent(vaultAddress.toHexString());
  let collateralType = createCollateralIfNonExistent(vault, tokenId.toString());
  let userPositions = createUserPositionsIfNonExistent(user);
  let position = createPositionIfNonExistent(
    vault,
    collateralType,
    userPositions,
  );

  createConfiscateEvent(position, event);

  let balance = getCodexBalance(vaultAddress, tokenId, collateralizer);
  let balanceEntity = createBalanceIfNotExistent(vaultAddress, tokenId, collateralizer);
  balanceEntity.balance = balance;
  balanceEntity.save();
}

function createBalanceIfNotExistent(vaultAddress: Address, tokenId: BigInt, collateralizer: Address): CodexBalance {
  let id = vaultAddress.toHexString() + "-" + tokenId.toHexString() + "-" + collateralizer.toHexString();
  let balanceEntity = CodexBalance.load(id);

  if (balanceEntity == null) {
    balanceEntity = new CodexBalance(id);
    balanceEntity.owner = collateralizer;
    balanceEntity.tokenId = tokenId;
    balanceEntity.vault = vaultAddress;
    balanceEntity.save();
  }

  return balanceEntity as CodexBalance;
}

export function handleGrantDelegate(event: GrantDelegate): void {
  let delegator = event.params.delegator;
  let delegatee = event.params.delegatee;
  let hasDelegate = getDelegates(delegator, delegatee);

  let delegates = createGrantDelegateIfNotExistent(delegator, delegatee);
  delegates.hasDelegate = hasDelegate;
  delegates.save();
}

export function handleRevokeDelegate(event: RevokeDelegate): void {
  let delegator = event.params.delegator;
  let delegatee = event.params.delegatee;
  let hasDelegate = getDelegates(delegator, delegatee);

  let delegates = createGrantDelegateIfNotExistent(delegator, delegatee);
  delegates.hasDelegate = hasDelegate;
  delegates.save();
}

function createGrantDelegateIfNotExistent(delegator: Address, delegatee: Address): Delegate {
  let id = delegator.toHexString() + "-" + delegatee.toHexString();
  let delegates = Delegate.load(id);

  if (delegates == null) {
    delegates = new Delegate(id);
    delegates.delegator = delegator;
    delegates.delegatee = delegatee;
    delegates.save();
  }
  return delegates as Delegate;
}

export function handleModifyBalance(event: ModifyBalance): void {
  let vaultAddress = event.params.vault;
  let tokenId = event.params.tokenId;
  let user = event.params.user;

  let balance = getCodexBalance(vaultAddress, tokenId, user);
  let balanceEntity = createBalanceIfNotExistent(vaultAddress, tokenId, user);
  balanceEntity.balance = balance;
  balanceEntity.save();
}

export function handleTransferBalance(event: TransferBalance): void {
  let vaultAddress = event.params.vault;
  let tokenId = event.params.tokenId;
  let source = event.params.src;
  let destination = event.params.dst;

  let balanceSrc = getCodexBalance(vaultAddress, tokenId, source);
  let balanceDst = getCodexBalance(vaultAddress, tokenId, destination);

  let balanceSrcEntity = createBalanceIfNotExistent(vaultAddress, tokenId, source);
  balanceSrcEntity.balance = balanceSrc;

  let balanceDstEntity = createBalanceIfNotExistent(vaultAddress, tokenId, destination);
  balanceDstEntity.balance = balanceDst;

  balanceSrcEntity.save();
  balanceDstEntity.save();
}

export function handleLock(event: Lock): void {
  let contractAddr = event.address;

  let id = contractAddr.toHexString();
  let live = IsCodexAlive.load(id);

  if (live == null) {
    live = new IsCodexAlive(id);
    live.isAlive = BIGINT_ZERO;
    live.save();
  }
}