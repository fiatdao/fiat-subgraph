import { BigInt, Address, ethereum } from '@graphprotocol/graph-ts'
import { clearStore, test, assert, newMockEvent, createMockedFunction } from 'matchstick-as/assembly/index'
import { Transfer, Approval } from "../generated/FIAT/FIAT";
import { createFIATIfNonExistent, handleFIATTransfer, createFIATTokenBalanceIfNonExistent, createFIATTokenAllowanceIfNonExistent, handleFIATApprovals } from "../src/fiat";
import { BIGINT_ZERO } from '../src/utils';

const ONE_ETH = 1000000000000000000;
const TOTAL_SUPPLY = 100;
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const FIAT_TOKEN_ADDRESS = "0x004e84d9eea17Bdad2912B475f7C473064A3Ca1C"; // FIAT deployed on goerli
const FROM = "0x0D3ff0A8672fcA127aA6DbE44BBcc935821Fdc7b";
const TO = "0xF80fe9AC3FCA0b44288CBdA6D6F633aff4Da9A3C";
const AMOUNT = BigInt.fromU64(ONE_ETH);

// Mocking the total supply in order to use it
createMockedFunction(Address.fromString(FIAT_TOKEN_ADDRESS), 'totalSupply', 'totalSupply():(uint256)')
    .withArgs([])
    .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(TOTAL_SUPPLY))]) // We say that the total supply is 100

test('FIAT_TEST - Transfer', () => {
    // Creating event with custom data fields
    let transferEvent = createTransferEvent(FROM, TO, AMOUNT);

    // Creating 'from' and 'to' example entities
    // attach to 'from' a balance of 1 ETH,
    // and to 'to' a balance of 0 ETH
    let fromEntity = createFIATTokenBalanceIfNonExistent(Address.fromString(FROM));
    fromEntity.balance = BigInt.fromU64(ONE_ETH);
    let toEntity = createFIATTokenBalanceIfNonExistent(Address.fromString(TO));
    toEntity.balance = BIGINT_ZERO;

    // Save these entities in the store
    fromEntity.save();
    toEntity.save();

    // Once we have our entities saved in the store, when executing the event
    // it is going to find by 'id' these entities, and it's going to update their balances
    handleFIATTransfer(transferEvent);

    // Finally asserting that 'FROM' have no balance left, since we transfered 1 ETH to the other address
    assert.fieldEquals("FIATTokenBalance", FROM.toLowerCase(), "balance", BIGINT_ZERO.toString());
    // Address 'TO' now have 1 ETH from address 'FROM'
    assert.fieldEquals("FIATTokenBalance", TO.toLowerCase(), "balance", ONE_ETH.toString());

    clearStore();
})

test('FIAT_TEST - Minting', () => {
    // Creating event with custom data fields, fromAddress is 0x0 - which is mint() operation
    // And we set amount which will mint 1000000000000000000 
    let transferEvent = createTransferEvent(ZERO_ADDRESS, TO, AMOUNT);

    // Creating example entity which we set minted to 0
    let mockedFiatEntity = createFIATIfNonExistent(transferEvent.address);
    mockedFiatEntity.minted = BIGINT_ZERO;
    mockedFiatEntity.save();

    // Once created above ^ we will have that entity, so the handler loads it and updates its 'minted' field
    handleFIATTransfer(transferEvent);

    // We check if the 'minted' value is equals to the 'AMOUNT' passed
    assert.fieldEquals("FIAT", FIAT_TOKEN_ADDRESS.toLowerCase(), "minted", AMOUNT.toString());

    clearStore();
})

test('FIAT_TEST - Burning', () => {
    // Creating event with custom data fields, toAddress is 0x0 - which is burn() operation
    // And we set amount which will burn 1000000000000000000 
    let transferEvent = createTransferEvent(FROM, ZERO_ADDRESS, AMOUNT);

    // Creating example entity which we set minted to 0
    let mockedFiatEntity = createFIATIfNonExistent(transferEvent.address);
    mockedFiatEntity.burned = BIGINT_ZERO;
    mockedFiatEntity.save();

    // Once created above ^ we will have that entity, so the handler loads it and updates its 'burned' field
    handleFIATTransfer(transferEvent);

    // We check if the 'burned' value is equals to the 'AMOUNT' passed
    assert.fieldEquals("FIAT", FIAT_TOKEN_ADDRESS.toLowerCase(), "burned", AMOUNT.toString());

    clearStore();
})

test('FIAT_TEST - TotalSupply', () => {
    // Creating event with custom data fields
    let transferEvent = createTransferEvent(FROM, TO, AMOUNT);

    // Creating example entity which we set totalSupply to 0
    let mockedFiatEntity = createFIATIfNonExistent(transferEvent.address);
    mockedFiatEntity.totalSupply = BIGINT_ZERO;
    mockedFiatEntity.save();

    // Once created above ^ we will have that entity, so the handler loads it and updates its 'totalSupply' field
    handleFIATTransfer(transferEvent);

    // We check if the 'totalSupply' value is equals to the mocked total supply - which is 100
    assert.fieldEquals("FIAT", FIAT_TOKEN_ADDRESS.toLowerCase(), "totalSupply", TOTAL_SUPPLY.toString());

    clearStore();
})

test('FIAT_TEST - Approvals', () => {
    // Creating event with custom data fields
    let approvalEvent = createApprovalEvent(FROM, TO, AMOUNT);

    // Creating example entity which we set approved amount to 0
    createFIATTokenAllowanceIfNonExistent(Address.fromString(FROM), Address.fromString(TO), BIGINT_ZERO);

    // Once created above ^ we will have that entity, so the handler loads it and updates its 'amount' field
    handleFIATApprovals(approvalEvent);

    // We check if the approved 'amount' value is equals to the 'amount' field that we passed in the event creation - which needs to be ONE_ETH
    const id = FROM + "-" + TO;
    assert.fieldEquals("FIATTokenAllowance", id.toLowerCase(), "amount", AMOUNT.toString());

    clearStore();
})

function createTransferEvent(fromAddress: string, toAddress: string, amountTransferred: BigInt): Transfer {
    let transferEvent = changetype<Transfer>(newMockEvent());
    transferEvent.parameters = new Array();
    transferEvent.address = Address.fromString(FIAT_TOKEN_ADDRESS);

    // Convert and init our params
    let from = new ethereum.EventParam("from", ethereum.Value.fromAddress(Address.fromString(fromAddress)));
    let to = new ethereum.EventParam("to", ethereum.Value.fromAddress(Address.fromString(toAddress)));
    let amount = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(amountTransferred));

    // Attach the fields to the event's parameter
    transferEvent.parameters.push(from);
    transferEvent.parameters.push(to);
    transferEvent.parameters.push(amount);

    return transferEvent;
}

function createApprovalEvent(ownerAddr: string, spenderAddr: string, amountToApprove: BigInt): Approval {
    let approvalEvent = changetype<Approval>(newMockEvent());
    approvalEvent.parameters = new Array();
    approvalEvent.address = Address.fromString(FIAT_TOKEN_ADDRESS);

    // Convert and init our params
    let owner = new ethereum.EventParam("owner", ethereum.Value.fromAddress(Address.fromString(ownerAddr)));
    let spender = new ethereum.EventParam("spender", ethereum.Value.fromAddress(Address.fromString(spenderAddr)));
    let amount = new ethereum.EventParam("amount", ethereum.Value.fromSignedBigInt(amountToApprove));

    // Attach the fields to the event's parameter
    approvalEvent.parameters.push(owner);
    approvalEvent.parameters.push(spender);
    approvalEvent.parameters.push(amount);

    return approvalEvent;
}