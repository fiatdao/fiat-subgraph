import { Bytes, BigInt, Address } from "@graphprotocol/graph-ts";
import { ModifyCollateralAndDebt, TransferCollateralAndDebt, ConfiscateCollateralAndDebt, Codex } from "../generated/Codex/Codex";
import { Position, PositionTransaction } from "../generated/schema";

const MODIFY = "MODIFY";
const TRANSFER = "TRANSFER";
const CONFISCATE = "CONFISCATE";

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
  let type = MODIFY;

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
    position.vault = vault.toHexString();
    position.tokenId = tokenId;
    position.user = user;
  }
  position.collateral = currentPosition.value0;
  position.normalDebt = currentPosition.value1;
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
  positionTransaction.collateral = position.collateral;
  positionTransaction.deltaCollateral = deltaCollateral;
  positionTransaction.normalDebt = position.normalDebt;
  positionTransaction.deltaNormalDebt = deltaNormalDebt;
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
  let type = TRANSFER;
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
  let type = CONFISCATE;

  createPositionTransaction(id, type, position, deltaCollateral, deltaNormalDebt);
}
