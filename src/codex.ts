import { BigInt, Address } from "@graphprotocol/graph-ts";
import { Codex as CodexContract, ModifyBalance, TransferBalance, SetParam, SetParam1 } from "../generated/Codex/Codex";
import { Balance, Codex, User } from "../generated/schema";
import { createUserIfNonExistent } from "./user";
import { createVaultIfNonExistent } from "./vault";

function createCodexIfNonExistent(codexAddress: Address): Codex {
  let codex = Codex.load(codexAddress.toHexString());
  if (codex == null) {
    codex = new Codex(codexAddress.toHexString());
    codex.save();
  }
  return codex as Codex
}

export function handleModifyBalance(event: ModifyBalance): void {
  let codex = CodexContract.bind(event.address);
  let user = createUserIfNonExistent(event.params.user);
  let balanceEntity = createBalanceIfNotExistent(event.params.vault, event.params.tokenId, user);
  balanceEntity.balance = codex.balances(event.params.vault, event.params.tokenId, event.params.user);
  balanceEntity.save();
}

export function handleTransferBalance(event: TransferBalance): void {
  let codex = CodexContract.bind(event.address);
  let srcUser = createUserIfNonExistent(event.params.src);
  let srcBalance = createBalanceIfNotExistent(event.params.vault, event.params.tokenId, srcUser);
  srcBalance.balance = codex.balances(event.params.vault, event.params.tokenId, event.params.src);
  srcBalance.save();

  let dstUser = createUserIfNonExistent(event.params.src);
  let dstBalance = createBalanceIfNotExistent(event.params.vault, event.params.tokenId, dstUser);
  dstBalance.balance = codex.balances(event.params.vault, event.params.tokenId, event.params.dst);
  dstBalance.save();
}

export function createBalanceIfNotExistent(vaultAddress: Address, tokenId: BigInt, user: User): Balance {
  let id = vaultAddress.toHexString() + "-" + tokenId.toHexString() + "-" + user.id.toString();

  let balance = Balance.load(id);
  if (balance == null) {
    balance = new Balance(id);
    balance.owner = user.id;
    balance.tokenId = tokenId;
    balance.vault = vaultAddress;
    balance.save();
  }

  return balance as Balance;
}

export function handleCodexSetParam(event: SetParam): void {
  let codex = createCodexIfNonExistent(event.address);
  if (event.params.param.toString() == "globalDebtCeiling") {
    codex.globalDebtCeiling = event.params.data;
  }
  codex.save();
}

export function handleCodexSetParam1(event: SetParam1): void {
  let vault = createVaultIfNonExistent(event.params.vault);
  if (event.params.param.toString() == "debtCeiling") {
    vault.debtCeiling = event.params.data;
  }
  if (event.params.param.toString() == "debtFloor") {
    vault.debtFloor = event.params.data;
  }
  vault.save();
}
