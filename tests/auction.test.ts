import { Address, BigInt, ethereum } from '@graphprotocol/graph-ts';
import { test, clearStore, createMockedFunction, assert, newMockEvent } from 'matchstick-as/assembly'
import {
    StopAuction,
    TakeCollateral,
} from "../generated/CollateralAuction/CollateralAuction";
import { CollateralAuction } from "../generated/schema";
import { handleStopAuction, handleTakeCollateral } from "../src/auctions";
import { BIGINT_ZERO } from '../src/utils';

const COLLATERAL_AUCTION_ADDRESS = "0x2651d4Bf4EDe0A65d3439f10e69dCe419d9e63D9"; // NoLossCollateral deployed on goerli
const AUCTION_ID = BigInt.fromI32(1);
const DEBT = BigInt.fromI32(1000);
const COLLATERAL_TO_SELL = BigInt.fromI32(100);

test('AUCTION - Start Auction - Not Implemented - Should throw', () => {
    // TODO: Will be completed when it's decided what we do with mocking and contract calls
    clearStore();
}, true)

test('AUCTION - Take Collateral', () => {
    createMockedFunction(Address.fromString(COLLATERAL_AUCTION_ADDRESS), 'list', 'list():(uint256[])')
        .withArgs([])
        .returns([ethereum.Value.fromUnsignedBigIntArray([BigInt.fromI64(1)])]); // We say that the list consist of one element, meaning there is active auctions

    // Creating event with custom data fields
    let takeCollateralEvent = createTakeCollateralEvent(AUCTION_ID, DEBT, COLLATERAL_TO_SELL);

    // Creating example entity which we set isActive to `true`
    let auctionEntity = new CollateralAuction(AUCTION_ID.toString());
    auctionEntity.debt = BIGINT_ZERO;
    auctionEntity.collateralToSell = BIGINT_ZERO;
    auctionEntity.save();

    // Once created above ^ we will have that entity, so the handler loads it and updates its 'debt' and 'collateralToSell' fields
    handleTakeCollateral(takeCollateralEvent);

    // We check if the 'debt' and 'collateralToSell' fields values are updated after the handler execution
    assert.fieldEquals("CollateralAuction", AUCTION_ID.toString(), "debt", DEBT.toString());
    assert.fieldEquals("CollateralAuction", AUCTION_ID.toString(), "collateralToSell", COLLATERAL_TO_SELL.toString());

    clearStore();
})

test('AUCTION - Stop Auction', () => {
    createMockedFunction(Address.fromString(COLLATERAL_AUCTION_ADDRESS), 'list', 'list():(uint256[])')
        .withArgs([])
        .returns([ethereum.Value.fromUnsignedBigIntArray([])]); // We say that the list is empty, meaning there is not active auctions

    // Creating event with custom data fields
    let stopAuctionEvent = createStopAuctionEvent(AUCTION_ID);

    // Creating example entity which we set isActive to `true`
    let auctionEntity = new CollateralAuction(AUCTION_ID.toString());
    auctionEntity.isActive = true;
    auctionEntity.save();

    // Once created above ^ we will have that entity, so the handler loads it and updates its 'isActive' field
    handleStopAuction(stopAuctionEvent);

    // We check if the 'isActive' value is equals to the 'false' from the mocked func
    assert.fieldEquals("CollateralAuction", AUCTION_ID.toString(), "isActive", "false");

    clearStore();
})

test('AUCTION - Redo Auction - Not Implemented - Should throw', () => {
    // TODO: Will be completed when it's decided what we do with mocking and contract calls
    clearStore();
}, true)

test('AUCTION - Set Param - Not Implemented - Should throw', () => {
    // TODO: Will be completed when it's uncommented + decided what we do with mocking and contract calls
    clearStore();
}, true)

test('AUCTION - Update Auction Debt Floor - Not Implemented - Should throw', () => {
    // TODO: Will be completed when it's decided what we do with mocking and contract calls
    clearStore();
}, true)

function createTakeCollateralEvent(auctionIdentification: BigInt, debtAmount: BigInt, collateralToSellAmount: BigInt): TakeCollateral {
    let takeCollateralEvent = changetype<TakeCollateral>(newMockEvent());
    takeCollateralEvent.parameters = new Array();
    takeCollateralEvent.address = Address.fromString(COLLATERAL_AUCTION_ADDRESS);

    // Convert and init our needed params
    let auctionId = new ethereum.EventParam("auctionId", ethereum.Value.fromSignedBigInt(auctionIdentification));
    let debt = new ethereum.EventParam("debt", ethereum.Value.fromSignedBigInt(debtAmount));
    let collateralToSell = new ethereum.EventParam("collateralToSell", ethereum.Value.fromSignedBigInt(collateralToSellAmount));

    // We need also to create params that we are not using in the handler
    let maxPrice = new ethereum.EventParam("maxPrice", ethereum.Value.fromSignedBigInt(BigInt.fromI32(0)));
    let price = new ethereum.EventParam("price", ethereum.Value.fromSignedBigInt(BigInt.fromI32(0)));
    let owe = new ethereum.EventParam("owe", ethereum.Value.fromSignedBigInt(BigInt.fromI32(0)));
    let vault = new ethereum.EventParam("vault", ethereum.Value.fromAddress(Address.fromString("0x8dC8d444786264b349C4D661e10b23A22FbE7466")));
    let tokenId = new ethereum.EventParam("tokenId", ethereum.Value.fromSignedBigInt(BigInt.fromI32(0)));
    let user = new ethereum.EventParam("user", ethereum.Value.fromAddress(Address.fromString("0x8dC8d444786264b349C4D661e10b23A22FbE7466")));

    // Attach the fields to the event's parameter, push even those, who are not gonna be using in this event handler
    takeCollateralEvent.parameters.push(auctionId);
    takeCollateralEvent.parameters.push(maxPrice);
    takeCollateralEvent.parameters.push(price);
    takeCollateralEvent.parameters.push(owe);
    takeCollateralEvent.parameters.push(debt);
    takeCollateralEvent.parameters.push(collateralToSell);
    takeCollateralEvent.parameters.push(vault);
    takeCollateralEvent.parameters.push(tokenId);
    takeCollateralEvent.parameters.push(user);

    return takeCollateralEvent;
}

function createStopAuctionEvent(auctionIdentification: BigInt): StopAuction {
    let stopAuctionEvent = changetype<StopAuction>(newMockEvent());
    stopAuctionEvent.parameters = new Array();
    stopAuctionEvent.address = Address.fromString(COLLATERAL_AUCTION_ADDRESS);

    // Convert and init our params
    let auctionId = new ethereum.EventParam("auctionId", ethereum.Value.fromSignedBigInt(auctionIdentification));

    // Attach the fields to the event's parameter
    stopAuctionEvent.parameters.push(auctionId);

    return stopAuctionEvent;
}