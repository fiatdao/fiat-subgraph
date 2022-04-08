import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
    GrantDelegate, RevokeDelegate, ModifyBalance, TransferBalance, SetParam
} from "../generated/Codex/Codex";
import { Delegate, Balance, Codex, User } from "../generated/schema";
import { createUserIfNonExistent } from "./position";
import { getCodexBalance, getDelegates } from "./utils";
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

function createCodexIfNonExistent(codexAddr: Address): Codex {
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
    balanceEntity.balance = getCodexBalance(event.params.vault, event.params.tokenId, event.params.user);
    balanceEntity.save();
}

export function handleTransferBalance(event: TransferBalance): void {
    // createCodexIfNonExistent(event.address);

    let srcUser = createUserIfNonExistent(event.params.src);
    let srcBalance = createBalanceIfNotExistent(event.params.vault, event.params.tokenId, srcUser);
    srcBalance.balance = getCodexBalance(event.params.vault, event.params.tokenId, event.params.src);
    srcBalance.save();

    let dstUser = createUserIfNonExistent(event.params.src);
    let dstBalance = createBalanceIfNotExistent(event.params.vault, event.params.tokenId, dstUser);
    dstBalance.balance = getCodexBalance(event.params.vault, event.params.tokenId, event.params.dst);
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

export function handleSetParam(event: SetParam): void {
    // workaround for wrongly emitted event in Codex
    if (event.params.param.toString() == "globalDebtCeiling") {
        let codex = createCodexIfNonExistent(event.address);
        codex.globalDebtCeiling = event.params.data;
        codex.save();
        return;
    }

    let vault = createVaultIfNonExistent(event.params.vault.toHexString());
    if (event.params.param.toString() == "debtCeiling") {
        vault.debtCeiling = event.params.data;
    }
    if (event.params.param.toString() == "debtFloor") {
        vault.debtFloor = event.params.data;
    }

    vault.save();
}
