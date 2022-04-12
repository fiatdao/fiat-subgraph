// import { BigInt, Address, ethereum } from '@graphprotocol/graph-ts'
// import { clearStore, test, assert, newMockEvent, createMockedFunction } from 'matchstick-as/assembly/index'
// import { createFIATIfNonExistent, handleFIATTransfer, createFIATTokenBalanceIfNonExistent, createFIATTokenAllowanceIfNonExistent, handleFIATApprovals } from "../src/fiat";
// import { handleMarketsInitialized } from "../src/notional";
// import { BIGINT_ZERO } from '../src/utils';
// import { MarketsInitialized, Notional } from "../generated/Notional/Notional";

// const ONE_ETH = 1000000000000000000;
// const TOTAL_SUPPLY = 100;
// const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
// const NOTIONAL_TOKEN_ADDRESS = "0xD8229B55bD73c61D840d339491219ec6Fa667B0a"; // Notional deployed on goerli
// const CURRENCY_ID = 13;

// // Mocking the total supply in order to use it
// createMockedFunction(Address.fromString(NOTIONAL_TOKEN_ADDRESS), 'getActiveMarketsAtBlockTime',
//     'getActiveMarketsAtBlockTime(uint16,uint32):((bytes32,uint256,int256,int256,int256,uint256,uint256,uint256)[])')
//     .withArgs([
//         ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(currencyId)),
//         ethereum.Value.fromUnsignedBigInt(blockTime)
//     ])
//     .returns([ethereum.Value.fromUnsignedBigInt(BigInt.fromI32(TOTAL_SUPPLY))]) // We say that the total supply is 100

// test('NOTIONAL - Markets Initialized', () => {
//     // Creating event with custom data fields
//     let marketInitEvent = createMarketsInitializedEvent(CURRENCY_ID);

//     // Creating example entity
//     let fromEntity = createFIATTokenBalanceIfNonExistent(Address.fromString(FROM));
//     fromEntity.balance = BigInt.fromU64(ONE_ETH);

//     // Save these entities in the store
//     toEntity.save();

//     // Once we have our entities saved in the store, when executing the event
//     // it is going to find by 'id' these entities, and it's going to update their balances
//     handleMarketsInitialized(marketInitEvent);

//     // Finally asserting that 'FROM' have no balance left, since we transfered 1 ETH to the other address
//     assert.fieldEquals("FIATTokenBalance", FROM.toLowerCase(), "balance", BIGINT_ZERO.toString());
//     // Address 'TO' now have 1 ETH from address 'FROM'
//     assert.fieldEquals("FIATTokenBalance", TO.toLowerCase(), "balance", ONE_ETH.toString());

//     clearStore();
// })

// function createMarketsInitializedEvent(currencyId: i32): MarketsInitialized {
//     let marketInitEvent = changetype<MarketsInitialized>(newMockEvent());
//     marketInitEvent.parameters = new Array();
//     marketInitEvent.address = Address.fromString(NOTIONAL_TOKEN_ADDRESS);
//     marketInitEvent.block.timestamp = 1649148949

//     // Convert and init our params
//     let currency = new ethereum.EventParam("currencyId", ethereum.Value.fromSignedBigInt(currencyId));

//     // Attach the fields to the event's parameter
//     marketInitEvent.parameters.push(currency);

//     return marketInitEvent;
// }