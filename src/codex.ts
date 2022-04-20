import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
    GrantDelegate, RevokeDelegate, ModifyBalance, TransferBalance, SetParam, SetParam1
} from "../generated/Codex/Codex";
import { Delegate, Balance, Codex, User } from "../generated/schema";
import { createUserIfNonExistent } from "./position";
import { getDelegates } from "./utils";
import { createVaultIfNonExistent } from "./vault/vaults";

export function handleGrantDelegate(event: GrantDelegate): void {
    let delegates = createGrantDelegateIfNotExistent(event.params.delegator, event.params.delegatee);
    delegates.hasDelegate = getDelegates(event.params.delegator, event.params.delegatee);
    delegates.save();

    let codex = createCodexIfNonExistent(event.address);
    codex.delegates = delegates.id;
    codex.save();
}

export function handleRevokeDelegate(event: RevokeDelegate): void {
    let codexContract = event.address;
    let delegator = event.params.delegator;
    let delegatee = event.params.delegatee;
    let hasDelegate = getDelegates(delegator, delegatee);

    let delegates = createGrantDelegateIfNotExistent(delegator, delegatee);
    delegates.hasDelegate = hasDelegate;
    delegates.save();

    let codex = createCodexIfNonExistent(codexContract);
    codex.delegates = delegates.id;
    codex.save();
}

export function createGrantDelegateIfNotExistent(delegator: Address, delegatee: Address): Delegate {
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

export function createCodexIfNonExistent(codexAddr: Address): Codex {
    let id = codexAddr.toHexString();

    let codex = Codex.load(id);
    if (codex == null) {
        codex = new Codex(id);
        codex.save();
    }

    return codex as Codex
}

export function handleModifyBalance(event: ModifyBalance): void {
    // createCodexIfNonExistent(event.address);

    let user = createUserIfNonExistent(event.params.user);
    let balanceEntity = createBalanceIfNotExistent(event.params.vault, event.params.tokenId, user);
    balanceEntity.balance = event.params.balance;
    balanceEntity.save();
}

export function handleTransferBalance(event: TransferBalance): void {
    // createCodexIfNonExistent(event.address);

    let srcUser = createUserIfNonExistent(event.params.src);
    let srcBalance = createBalanceIfNotExistent(event.params.vault, event.params.tokenId, srcUser);
    srcBalance.balance = event.params.srcBalance;
    srcBalance.save();

    let dstUser = createUserIfNonExistent(event.params.dst);
    let dstBalance = createBalanceIfNotExistent(event.params.vault, event.params.tokenId, dstUser);
    dstBalance.balance = event.params.dstBalance;
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
    let vault = createVaultIfNonExistent(event.params.vault.toHexString());
    if (event.params.param.toString() == "debtCeiling") {
        vault.debtCeiling = event.params.data;
    }
    if (event.params.param.toString() == "debtFloor") {
        vault.debtFloor = event.params.data;
    }
    vault.save();
}
