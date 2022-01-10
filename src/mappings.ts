import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import { DeployProxy } from "../generated/PRBProxyFactory/PRBProxyFactory";
import { ModifyCollateralAndDebt, TransferCollateralAndDebt, ConfiscateCollateralAndDebt } from "../generated/Codex/Codex";
import { UserProxy, Position, PositionTransaction } from "../generated/schema";

export function handleDeployProxy(event: DeployProxy): void {
  let userAddress = event.params.owner;
  let proxyAddress = event.params.proxy;
  createUserProxyIfNonExistent(userAddress, proxyAddress);
}

export function createUserProxyIfNonExistent(userAddress: Bytes, proxyAddress: Bytes): UserProxy {
  let address = userAddress.toHexString();
  let userProxy = UserProxy.load(address);
  if (userProxy == null) {
    userProxy = new UserProxy(address);
  }
  userProxy.userAddress = userAddress;
  userProxy.proxyAddress = proxyAddress;
  userProxy.save();
  return userProxy as UserProxy;
}

export function handleModifyCollateralAndDebt(event: ModifyCollateralAndDebt): void {
  let vault = event.params.vault;
  let tokenId = event.params.tokenId;
  let user = event.params.user;
  // let collateralizer = event.params.collateralizer;
  // let creditor = event.params.creditor;
  let deltaCollateral = event.params.deltaCollateral;
  let deltaNormalDebt = event.params.deltaNormalDebt;

  let position = createPositionIfNonExistent(
    vault,
    tokenId,
    user,
  );
  addPositionCollateralAndDebt(position, deltaCollateral, deltaNormalDebt);
  position.save();

  let id = event.transaction.hash;
  let type = "MINT";

  createPositionTransaction(id, type, position);
}

export function createPositionIfNonExistent(
  vault: Bytes,
  tokenId: BigInt,
  user: Bytes,
): Position {
  let vaultAddress = vault.toHexString();
  let userAddress = user.toHexString();
  let id = vaultAddress + "-" + tokenId.toHexString() + "-" + userAddress;

  let position = Position.load(id);
  if (position == null) {
    position = new Position(id);
    position.vault = vault;
    position.tokenId = tokenId;
    position.user = user;
  }
  return position as Position;
}

export function createPositionTransaction(transactionHash: Bytes, type: string, position: Position): PositionTransaction {
  let id = transactionHash.toHexString() + "-" + position.id;
  let positionTransaction = new PositionTransaction(id);
  positionTransaction.type = type;
  positionTransaction.position = position.id;
  positionTransaction.save();
  return positionTransaction as PositionTransaction;
}

export function handleTransferCollateralAndDebt(event: TransferCollateralAndDebt): void {
  let vault = event.params.vault;
  let tokenId = event.params.tokenId;
  let userSrc = event.params.src;
  let userDst = event.params.dst;
  let deltaCollateral = event.params.deltaCollateral;
  let deltaNormalDebt = event.params.deltaNormalDebt;

  let positionSrc = createPositionIfNonExistent(
    vault,
    tokenId,
    userSrc,
  );
  let positionDst = createPositionIfNonExistent(
    vault,
    tokenId,
    userDst,
  );
  minusPositionCollateralAndDebt(positionSrc, deltaCollateral, deltaNormalDebt);
  positionSrc.save();

  addPositionCollateralAndDebt(positionDst, deltaCollateral, deltaNormalDebt);
  positionDst.save();

  let id = event.transaction.hash;
  let type = "TRANSFER";
  createPositionTransaction(id, type, positionSrc);
  createPositionTransaction(id, type, positionDst);
}

export function handleConfiscateCollateralAndDebt(event: ConfiscateCollateralAndDebt): void {
  let vault = event.params.vault;
  let tokenId = event.params.tokenId;
  let user = event.params.user;
  // let collateralizer = event.params.collateralizer;
  // let creditor = event.params.creditor;
  let deltaCollateral = event.params.deltaCollateral;
  let deltaNormalDebt = event.params.deltaNormalDebt;

  let position = createPositionIfNonExistent(
    vault,
    tokenId,
    user,
  );
  addPositionCollateralAndDebt(position, deltaCollateral, deltaNormalDebt);
  position.save();

  let id = event.transaction.hash;
  let type = "CONFISCATE";

  createPositionTransaction(id, type, position);
}

export function addPositionCollateralAndDebt(position: Position, collateral: BigInt, normalDebt: BigInt): void {
  position.collateral = position.collateral.plus(collateral);
  position.maxCollateral = max(position.maxCollateral, position.collateral);
  position.normalDebt = position.normalDebt.plus(normalDebt);
  position.maxNormalDebt = max(position.maxNormalDebt, position.normalDebt);
}

export function minusPositionCollateralAndDebt(position: Position, collateral: BigInt, normalDebt: BigInt): void {
  position.collateral = position.collateral.minus(collateral);
  position.maxCollateral = max(position.maxCollateral, position.collateral);
  position.normalDebt = position.normalDebt.minus(normalDebt);
  position.maxNormalDebt = max(position.maxNormalDebt, position.normalDebt);
}


export function max(a: BigInt | null, b: BigInt): BigInt {
  if (a == null) return b;
  return a >= b ? a as BigInt : b;
}
