import { BigInt, Address } from "@graphprotocol/graph-ts";
import { GrantDelegate, RevokeDelegate, Lock, ModifyBalance, TransferBalance, SetParam } from "../generated/Codex/Codex";
import { Delegate, Balance, Codex } from "../generated/schema";
import { BIGINT_ZERO, BIGINT_ONE, getCodexBalance, getDelegates } from "./utils";
import { createVaultIfNonExistent } from "./vault/vaults";

export function handleGrantDelegate(event: GrantDelegate): void {
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
        codex.isAlive = BIGINT_ONE;
        codex.save();
    }

    return codex as Codex
}

export function handleModifyBalance(event: ModifyBalance): void {
    let codexContract = event.address;
    let vaultAddress = event.params.vault;
    let tokenId = event.params.tokenId;
    let user = event.params.user;

    let codex = createCodexIfNonExistent(codexContract);
    codex.vault = vaultAddress.toHexString();
    codex.save();

    let balance = getCodexBalance(vaultAddress, tokenId, user);
    let balanceEntity = createBalanceIfNotExistent(vaultAddress, tokenId, user);
    balanceEntity.balance = balance;
    balanceEntity.save();
}

export function handleTransferBalance(event: TransferBalance): void {
    let codexContract = event.address;
    let vaultAddress = event.params.vault;
    let tokenId = event.params.tokenId;
    let source = event.params.src;
    let destination = event.params.dst;

    let codex = createCodexIfNonExistent(codexContract);
    codex.vault = vaultAddress.toHexString();
    codex.save();

    let balanceSrc = getCodexBalance(vaultAddress, tokenId, source);
    let balanceDst = getCodexBalance(vaultAddress, tokenId, destination);

    let balanceSrcEntity = createBalanceIfNotExistent(vaultAddress, tokenId, source);
    balanceSrcEntity.balance = balanceSrc;

    let balanceDstEntity = createBalanceIfNotExistent(vaultAddress, tokenId, destination);
    balanceDstEntity.balance = balanceDst;

    balanceSrcEntity.save();
    balanceDstEntity.save();
}

export function createBalanceIfNotExistent(vaultAddress: Address, tokenId: BigInt, collateralizer: Address): Balance {
    let id = vaultAddress.toHexString() + "-" + tokenId.toHexString() + "-" + collateralizer.toHexString();
    let balanceEntity = Balance.load(id);

    if (balanceEntity == null) {
        balanceEntity = new Balance(id);
        balanceEntity.owner = collateralizer;
        balanceEntity.tokenId = tokenId;
        balanceEntity.vault = vaultAddress;
        balanceEntity.save();
    }

    return balanceEntity as Balance;
}

export function handleSetParam(event: SetParam): void {
    let codexContract = event.address;
    let vaultAddress = event.params.vault;
    let param = event.params.param;
    let data = event.params.data;

    let codex = createCodexIfNonExistent(codexContract);
    codex.vault = vaultAddress.toHexString();
    codex.save();

    // workaround for wrongly emitted event in Codex
    if (param.toString() == "globalDebtCeiling") {
        codex.globalDebtCeiling = data;
        codex.save();
        return;
    }

    let vault = createVaultIfNonExistent(vaultAddress.toHexString());

    if (param.toString() == "debtCeiling") {
        vault.debtCeiling = data;
    }
    if (param.toString() == "debtFloor") {
        vault.debtFloor = data;
    }

    vault.save();
}

export function handleLock(event: Lock): void {
    let contractAddr = event.address;

    let codex = createCodexIfNonExistent(contractAddr);
    codex.isAlive = BIGINT_ZERO;
    codex.save();
}