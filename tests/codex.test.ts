import {
    GrantDelegate, RevokeDelegate, ModifyBalance, TransferBalance, SetParam, SetParam1,
} from "../generated/Codex/Codex";
import { BigInt, Address, ethereum } from '@graphprotocol/graph-ts'
import { clearStore, test, assert, newMockEvent, createMockedFunction } from 'matchstick-as/assembly/index'
import { createUserIfNonExistent } from "../src/position";
import { handleGrantDelegate, createGrantDelegateIfNotExistent, createCodexIfNonExistent, handleRevokeDelegate, handleTransferBalance, createBalanceIfNotExistent, handleModifyBalance } from "../src/codex";

const GRANT_DELEGATE_RESULT = 1;
const REVOKE_DELEGATE_RESULT = 0;
const CODEX_ADDRESS = "0x56974fC4bB4Dc18dDDa06B2056f1Bdfef0eCA0FF"; // Codex deployed on goerli
const DELEGATOR = "0x0D3ff0A8672fcA127aA6DbE44BBcc935821Fdc7b";
const DELEGATEE = "0xF80fe9AC3FCA0b44288CBdA6D6F633aff4Da9A3C";
const VAULT = "0xa11DCf4E9df10901af2A115E6347A2f9AF2E40d4";
const TOKEN_ID = BigInt.fromU32(1);
const USER = "0x7f8721E0049A49261E3Ae64454442477279325A0";
const ZERO_BALANCE = 0;
const BALANCE = 1000;

test('CODEX_TEST - Grant Delegate', () => {
    // Mocking the get delegate in order to use it
    createMockedFunction(Address.fromString(CODEX_ADDRESS), 'delegates', 'delegates(address,address):(uint256)')
        .withArgs([ethereum.Value.fromAddress(Address.fromString(DELEGATOR)), ethereum.Value.fromAddress(Address.fromString(DELEGATEE))])
        .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(GRANT_DELEGATE_RESULT))]) // We say that the delegate result will return 1, since this is what we expect from grantDelegate event

    // Creating event with custom data fields
    let grantDeleEvent = grantDelegateEvent(DELEGATOR, DELEGATEE);

    // Create an entity with delegator and delegatee, and the rest props are empty
    createGrantDelegateIfNotExistent(Address.fromString(DELEGATOR), Address.fromString(DELEGATEE));

    // Creating empty Codex entity, which we will use for assertion
    createCodexIfNonExistent(Address.fromString(CODEX_ADDRESS));

    // Once we have our entity saved in the store, when executing the event below
    // it is going to find by 'id' this entity, and it's going to update their 'hasDelegate' prop
    handleGrantDelegate(grantDeleEvent);

    // Building the 'id' that Delegate entity is using
    const delegateId = DELEGATOR.toLowerCase() + "-" + DELEGATEE.toLowerCase();

    // Finally asserting that 'hasDelegate' is 1, because we created the entity with 0 (default) and when we executed the handler, it update it to  1
    assert.fieldEquals("Delegate", delegateId, "hasDelegate", GRANT_DELEGATE_RESULT.toString());
    // Our handler also updates the 'delegates' field of the Codex, so we check if that update happend
    assert.fieldEquals("Codex", CODEX_ADDRESS.toLowerCase(), "delegates", delegateId);

    clearStore();
})

test('CODEX_TEST - Revoke Delegate', () => {
    // Mocking the get delegate in order to use it
    createMockedFunction(Address.fromString(CODEX_ADDRESS), 'delegates', 'delegates(address,address):(uint256)')
        .withArgs([ethereum.Value.fromAddress(Address.fromString(DELEGATOR)), ethereum.Value.fromAddress(Address.fromString(DELEGATEE))])
        .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromU64(REVOKE_DELEGATE_RESULT))]) // We say that the delegate result will return 0, since this is what we expect from revokeDelegate event

    // Creating event with custom data fields
    let revokeDeleEvent = revokeDelegateEvent(DELEGATOR, DELEGATEE);

    // Create an entity with delegator and delegatee, and the rest props are empty
    let delegate = createGrantDelegateIfNotExistent(Address.fromString(DELEGATOR), Address.fromString(DELEGATEE));
    delegate.hasDelegate = BigInt.fromI32(1);
    delegate.save();

    // Creating empty Codex entity, which we will use for assertion
    createCodexIfNonExistent(Address.fromString(CODEX_ADDRESS));

    // Once we have our entity saved in the store, when executing the event below
    // it is going to find by 'id' this entity, and it's going to update their 'hasDelegate' prop
    handleRevokeDelegate(revokeDeleEvent);

    // Building the 'id' that Delegate entity is using
    const delegateId = DELEGATOR.toLowerCase() + "-" + DELEGATEE.toLowerCase();

    // Finally asserting that 'hasDelegate' is 0, because we created the entity with 1 and when we executed the handler, it needs to update it to 0
    assert.fieldEquals("Delegate", delegateId, "hasDelegate", REVOKE_DELEGATE_RESULT.toString());
    // Our handler also updates the 'delegates' field of the Codex, so we check if that update happend
    assert.fieldEquals("Codex", CODEX_ADDRESS.toLowerCase(), "delegates", delegateId);

    clearStore();
})

test('CODEX_TEST - Modify Balance', () => {
    // Creating event with custom data fields
    let modifyBalEvent = modifyBalanceEvent(USER, VAULT, TOKEN_ID, BigInt.fromI64(BALANCE));

    // Create an User entity
    let user = createUserIfNonExistent(Address.fromString(USER));
    // Creating a Codex Balance with all the 3 properties
    createBalanceIfNotExistent(Address.fromString(VAULT), TOKEN_ID, user);

    // Once we have our balance entity saved in the store, when executing the event
    // it is going to find by 'id' this entity, and it's going to modify its balances
    handleModifyBalance(modifyBalEvent);

    // Building the 'id' that Balance entity is using
    const id = VAULT.toLowerCase() + "-" + TOKEN_ID.toHexString() + "-" + USER.toLowerCase();

    // Finally asserting that 'balance' is 1000, because we created the entity with 0 (default) and when we executed the handler, it modifies it to  1000
    assert.fieldEquals("Balance", id, "balance", BALANCE.toString());

    clearStore();
})

test('CODEX_TEST - Transfer Balance', () => {
    // Creating event with custom data fields
    let transBalanceEvent = transferBalanceEvent(VAULT, TOKEN_ID, DELEGATOR, DELEGATEE);

    // Creating src User entity which will make transfer to dst User and setting its balance to 1000 initially
    let srcUser = createUserIfNonExistent(Address.fromString(DELEGATOR));
    let srcBalance = createBalanceIfNotExistent(Address.fromString(VAULT), TOKEN_ID, srcUser);
    srcBalance.balance = BigInt.fromI64(BALANCE);
    srcBalance.save();

    // Creating dst User entity which will receive a transfer from src User and setting its balance to 0 initially
    let dstUser = createUserIfNonExistent(Address.fromString(DELEGATEE));
    let dstBalanace = createBalanceIfNotExistent(Address.fromString(VAULT), TOKEN_ID, dstUser);
    dstBalanace.balance = BigInt.fromI64(ZERO_BALANCE);
    dstBalanace.save();

    // Once we have our src/dst User entities saved in the store, when executing the event handler
    // it is going to find by 'id' this entities, and it's going to update their 'balance' field
    handleTransferBalance(transBalanceEvent);

    // Building 'id's' that Balance entity is using for both src/dst Users
    const srcId = VAULT.toLowerCase() + "-" + TOKEN_ID.toHexString() + "-" + srcUser.id;
    const dstId = VAULT.toLowerCase() + "-" + TOKEN_ID.toHexString() + "-" + dstUser.id;

    // Finally asserting that 'balance' of srcUser is 0, because we created the entity with 1000 and when we executed the handler, it modifies it to 0
    // And the same thing we assert for 'balance' of dstUser to be 100, because we created the entity with 0 and when we executed the handler, it modifies it to 1000
    assert.fieldEquals("Balance", srcId, "balance", ZERO_BALANCE.toString());
    assert.fieldEquals("Balance", dstId, "balance", BALANCE.toString());

    clearStore();
})

function grantDelegateEvent(delegatorAddress: string, delegateeAddress: string): GrantDelegate {
    let grantDelegateEvent = changetype<GrantDelegate>(newMockEvent());
    grantDelegateEvent.parameters = new Array();
    grantDelegateEvent.address = Address.fromString(CODEX_ADDRESS);

    // Convert and init our params
    let delegator = new ethereum.EventParam("delegator", ethereum.Value.fromAddress(Address.fromString(delegatorAddress)));
    let delegatee = new ethereum.EventParam("delegatee", ethereum.Value.fromAddress(Address.fromString(delegateeAddress)));

    // Attach the fields to the event's parameter
    grantDelegateEvent.parameters.push(delegator);
    grantDelegateEvent.parameters.push(delegatee);

    return grantDelegateEvent;
}

function revokeDelegateEvent(delegatorAddress: string, delegateeAddress: string): RevokeDelegate {
    let revokeDelegateEvent = changetype<RevokeDelegate>(newMockEvent());
    revokeDelegateEvent.parameters = new Array();
    revokeDelegateEvent.address = Address.fromString(CODEX_ADDRESS);

    // Convert and init our params
    let delegator = new ethereum.EventParam("delegator", ethereum.Value.fromAddress(Address.fromString(delegatorAddress)));
    let delegatee = new ethereum.EventParam("delegatee", ethereum.Value.fromAddress(Address.fromString(delegateeAddress)));

    // Attach the fields to the event's parameter
    revokeDelegateEvent.parameters.push(delegator);
    revokeDelegateEvent.parameters.push(delegatee);

    return revokeDelegateEvent;
}

function modifyBalanceEvent(userAddr: string, vaultAddr: string, tokenIdentifier: BigInt, balanceNum: BigInt): ModifyBalance {
    let modifyBalanceEvent = changetype<ModifyBalance>(newMockEvent());
    modifyBalanceEvent.parameters = new Array();
    modifyBalanceEvent.address = Address.fromString(CODEX_ADDRESS);

    // Convert and init our params
    let vault = new ethereum.EventParam("vault", ethereum.Value.fromAddress(Address.fromString(vaultAddr)));
    let tokenId = new ethereum.EventParam("tokenId", ethereum.Value.fromSignedBigInt(tokenIdentifier));
    let user = new ethereum.EventParam("user", ethereum.Value.fromAddress(Address.fromString(userAddr)));
    let amount = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(BigInt.fromI32(0)));
    let balance = new ethereum.EventParam("number", ethereum.Value.fromSignedBigInt(balanceNum));

    // Attach the fields to the event's parameter
    modifyBalanceEvent.parameters.push(vault);
    modifyBalanceEvent.parameters.push(tokenId);
    modifyBalanceEvent.parameters.push(user);
    modifyBalanceEvent.parameters.push(amount);
    modifyBalanceEvent.parameters.push(balance);

    return modifyBalanceEvent;
}

function transferBalanceEvent(vaultAddr: string, tokenIdentifier: BigInt, srcAddr: string, dstAddr: string): TransferBalance {
    let transferBalanceEvent = changetype<TransferBalance>(newMockEvent());
    transferBalanceEvent.parameters = new Array();
    transferBalanceEvent.address = Address.fromString(CODEX_ADDRESS);

    // Convert and init our params
    let vault = new ethereum.EventParam("vault", ethereum.Value.fromAddress(Address.fromString(vaultAddr)));
    let tokenId = new ethereum.EventParam("tokenId", ethereum.Value.fromSignedBigInt(tokenIdentifier));
    let src = new ethereum.EventParam("src", ethereum.Value.fromAddress(Address.fromString(srcAddr)));
    let dst = new ethereum.EventParam("dst", ethereum.Value.fromAddress(Address.fromString(dstAddr)));
    let amount = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(BigInt.fromI32(ZERO_BALANCE)));
    let srcBalance = new ethereum.EventParam("srcBalance", ethereum.Value.fromSignedBigInt(BigInt.fromI64(ZERO_BALANCE)));
    let dstBalance = new ethereum.EventParam("dstBalance", ethereum.Value.fromSignedBigInt(BigInt.fromI64(BALANCE)));

    // Attach the fields to the event's parameter
    transferBalanceEvent.parameters.push(vault);
    transferBalanceEvent.parameters.push(tokenId);
    transferBalanceEvent.parameters.push(src);
    transferBalanceEvent.parameters.push(dst);
    transferBalanceEvent.parameters.push(amount);
    transferBalanceEvent.parameters.push(srcBalance);
    transferBalanceEvent.parameters.push(dstBalance);

    return transferBalanceEvent;
}

function setParamEvent(paramData: BigInt, parameter: string): SetParam {
    let setParamEvent = changetype<SetParam>(newMockEvent());
    setParamEvent.parameters = new Array();
    setParamEvent.address = Address.fromString(CODEX_ADDRESS);

    // Convert and init our params
    let param = new ethereum.EventParam("param", ethereum.Value.fromBytes(Bytes.fromHexString(parameter)));
    let data = new ethereum.EventParam("data", ethereum.Value.fromSignedBigInt(paramData));

    // Attach the fields to the event's parameter
    setParamEvent.parameters.push(param);
    setParamEvent.parameters.push(data);

    return setParamEvent;
}

function setParamEvent1(paramData: BigInt, parameter: string, vaultAddr: string): SetParam1 {
    let setParamEvent1 = changetype<SetParam1>(newMockEvent());
    setParamEvent1.parameters = new Array();
    setParamEvent1.address = Address.fromString(CODEX_ADDRESS);

    // Convert and init our params
    let vault = new ethereum.EventParam("vault", ethereum.Value.fromAddress(Address.fromString(vaultAddr)));
    let param = new ethereum.EventParam("param", ethereum.Value.fromBytes(Bytes.fromHexString(parameter)));
    let data = new ethereum.EventParam("data", ethereum.Value.fromSignedBigInt(paramData));

    // Attach the fields to the event's parameter
    setParamEvent1.parameters.push(param);
    setParamEvent1.parameters.push(data);

    return setParamEvent1;
}