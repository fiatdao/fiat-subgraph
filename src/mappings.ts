import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts";
import { DeployProxy } from "../generated/PRBProxyFactory/PRBProxyFactory";
import { ModifyCollateralAndDebt, TransferCollateralAndDebt, ConfiscateCollateralAndDebt, Codex } from "../generated/Codex/Codex";
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
  let codexContract = Codex.bind(event.address);
  let vault = event.params.vault;
  let tokenId = event.params.tokenId;
  let user = event.params.user;
  // let collateralizer = event.params.collateralizer;
  // let creditor = event.params.creditor;
  let deltaCollateral = event.params.deltaCollateral;
  let deltaNormalDebt = event.params.deltaNormalDebt;

  let position = createPositionIfNonExistent(
    codexContract,
    vault,
    tokenId,
    user,
  );

  let id = event.transaction.hash;
  let type = "MINT";

  createPositionTransaction(id, type, position, deltaCollateral, deltaNormalDebt);
}

export function createPositionIfNonExistent(
  codex: Codex,
  vault: Bytes,
  tokenId: BigInt,
  user: Bytes,
  ): Position {
  let vaultAddress = vault.toHexString();
  let userAddress = user.toHexString();
  let currentPosition = codex.positions(vault as Address, tokenId, user as Address);
  let id = vaultAddress + "-" + tokenId.toHexString() + "-" + userAddress;

  let position = Position.load(id);
  if (position == null) {
    position = new Position(id);
    position.vault = vault;
    position.tokenId = tokenId;
    position.user = user;
  }
  position.maxCollateral = max(position.maxCollateral, currentPosition.value0);
  position.collateral = currentPosition.value0;
  position.maxNormalDebt = max(position.maxNormalDebt, currentPosition.value1);
  position.normalDebt = currentPosition.value1;
  position.save();
  return position as Position;
}

export function createPositionTransaction(transactionHash: Bytes, type: string, position: Position, collateral: BigInt, normalDebt: BigInt): PositionTransaction {
  let id = transactionHash.toHexString() + "-" + position.id;
  let positionTransaction = new PositionTransaction(id);
  positionTransaction.type = type;
  positionTransaction.position = position.id;
  positionTransaction.collateral = collateral;
  positionTransaction.normalDebt = normalDebt;
  positionTransaction.save();
  return positionTransaction as PositionTransaction;
}

export function handleTransferCollateralAndDebt(event: TransferCollateralAndDebt): void {
  let codexContract = Codex.bind(event.address);
  let vault = event.params.vault;
  let tokenId = event.params.tokenId;
  let userSrc = event.params.src;
  let userDst = event.params.dst;
  let deltaCollateral = event.params.deltaCollateral;
  let deltaNormalDebt = event.params.deltaNormalDebt;

  let positionSrc = createPositionIfNonExistent(
    codexContract,
    vault,
    tokenId,
    userSrc,
  );
  let positionDst = createPositionIfNonExistent(
    codexContract,
    vault,
    tokenId,
    userDst,
  );

  let id = event.transaction.hash;
  let type = "TRANSFER";
  createPositionTransaction(id, type, positionSrc, deltaCollateral, deltaNormalDebt);
  createPositionTransaction(id, type, positionDst, deltaCollateral, deltaNormalDebt);
}

export function handleConfiscateCollateralAndDebt(event: ConfiscateCollateralAndDebt): void {
  let codexContract = Codex.bind(event.address);
  let vault = event.params.vault;
  let tokenId = event.params.tokenId;
  let user = event.params.user;
  // let collateralizer = event.params.collateralizer;
  // let creditor = event.params.creditor;
  let deltaCollateral = event.params.deltaCollateral;
  let deltaNormalDebt = event.params.deltaNormalDebt;

  let position = createPositionIfNonExistent(
    codexContract,
    vault,
    tokenId,
    user,
  );

  let id = event.transaction.hash;
  let type = "CONFISCATE";

  createPositionTransaction(id, type, position, deltaCollateral, deltaNormalDebt);
}

export function max(a: BigInt | null, b: BigInt): BigInt {
  if (a == null) return b;
  return a >= b ? a as BigInt : b;
}
