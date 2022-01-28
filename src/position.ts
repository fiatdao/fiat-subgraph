import { Bytes, BigInt, Address, log } from "@graphprotocol/graph-ts";
import { ModifyCollateralAndDebt, TransferCollateralAndDebt, ConfiscateCollateralAndDebt, Codex } from "../generated/Codex/Codex";
import { IVault } from "../generated/Codex/IVault";
import { Collybus } from "../generated/Codex/Collybus";
import { Position, PositionTransaction, UserPosition } from "../generated/schema";
import { min } from "./utils";
import { COLLYBUS_ADDRESS } from "./constants";

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

  let userPosition = createUserPositionIfNonExistent(user);
  let position = createPositionIfNonExistent(
    codexContract,
    vault,
    tokenId,
    userPosition,
  );

  let id = event.transaction.hash;
  let type = MODIFY;

  let tx = createPositionTransaction(id, type, position, deltaCollateral, deltaNormalDebt);

  updateUserPosition(userPosition, position, tx);
}

export function createPositionIfNonExistent(
  codex: Codex,
  vault: Bytes,
  tokenId: BigInt,
  user: UserPosition,
  ): Position {
  let vaultAddress = vault.toHexString();
  let userAddress = user.id;
  let currentPosition = codex.positions(vault as Address, tokenId, Address.fromString(userAddress));
  let id = vaultAddress + "-" + tokenId.toHexString() + "-" + userAddress;

  let position = Position.load(id);
  if (position == null) {
    position = new Position(id);
    position.vault = vault.toHexString();
    position.tokenId = tokenId;
    position.user = userAddress;
  }
  position.collateral = currentPosition.value0;
  position.normalDebt = currentPosition.value1;

  let iVault = IVault.bind(vault as Address);
  let maturity = iVault.try_maturity(tokenId);
  if (!maturity.reverted) {
    position.maturity = maturity.value;
    let collybus = Collybus.bind(Address.fromString(COLLYBUS_ADDRESS));
    let underlier = iVault.try_underlierToken();

    if (!underlier.reverted) {
      let underlierAddress = underlier.value;
      let currentValue = collybus.try_read(
        vault as Address,
        underlierAddress,
        tokenId,
        position.maturity!,
        false
      )
      if (!currentValue.reverted && !position.normalDebt.isZero()) {
        position.healthFactor = currentValue.value.times(position.collateral).div(position.normalDebt);
      }
      if (position.healthFactor !== null) {
        let vaultConfig = collybus.try_vaults(vault as Address);
        if (!vaultConfig.reverted && !vaultConfig.value.value0.isZero()) {
          position.isAtRisk = position.healthFactor.le(vaultConfig.value.value0);
        }
      }
    }
  }

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

export function createUserPositionIfNonExistent(userAddress: Bytes): UserPosition {
  let id = userAddress.toHexString();
  let userPosition = UserPosition.load(id);

  if (userPosition == null) {
    userPosition = new UserPosition(id);
    userPosition.totalCollateral = BigInt.fromI32(0);
    userPosition.totalFIAT = BigInt.fromI32(0);
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
  if (position.healthFactor) {
    userPosition.lowestHealthFactor = min(userPosition.lowestHealthFactor, position.healthFactor!);
  }

  userPosition.save();
}

export function handleTransferCollateralAndDebt(event: TransferCollateralAndDebt): void {
  let codexContract = Codex.bind(event.address);
  let vault = event.params.vault;
  let tokenId = event.params.tokenId;
  let userSrc = event.params.src;
  let userDst = event.params.dst;
  let deltaCollateral = event.params.deltaCollateral;
  let deltaNormalDebt = event.params.deltaNormalDebt;

  let userPositionSrc = createUserPositionIfNonExistent(userSrc);
  let userPositionDst = createUserPositionIfNonExistent(userDst);

  let positionSrc = createPositionIfNonExistent(
    codexContract,
    vault,
    tokenId,
    userPositionSrc,
  );
  let positionDst = createPositionIfNonExistent(
    codexContract,
    vault,
    tokenId,
    userPositionDst,
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

  let userPosition = createUserPositionIfNonExistent(user);

  let position = createPositionIfNonExistent(
    codexContract,
    vault,
    tokenId,
    userPosition,
  );

  let id = event.transaction.hash;
  let type = CONFISCATE;

  createPositionTransaction(id, type, position, deltaCollateral, deltaNormalDebt);
}
