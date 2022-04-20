import { BigInt, Address, ethereum } from '@graphprotocol/graph-ts'
import { clearStore, test, assert, newMockEvent } from 'matchstick-as/assembly/index'
import { handleCollybusUpdateSpot, createCollybusSpotIfNonExistent, createCollybusRateIfNonExistent, createCollybusIfNonExistent, handleCollybusUpdateDiscountRate } from "../src/collybus";
import { SetParam1, SetParam2, UpdateSpot, UpdateDiscountRate, } from "../generated/Codex/Collybus";

// TODO: SetParam1 - test will be completed when it's decided what we do with mocking and contract calls
// TODO: SetParam2 - not implemented yet in the code

const ONE_ETH = 1000000000000000000;
const COLLYBUS_TOKEN_ADDRESS = "0xB894853D5771B588530394065D44A33BcB314aC5"; // FIAT deployed on goerli
const TOKEN = "0x0D3ff0A8672fcA127aA6DbE44BBcc935821Fdc7b";
const SPOT = BigInt.fromU64(ONE_ETH);
const DISCOUNT_RATE = BigInt.fromU64(100);
const RATE_ID = BigInt.fromU64(1);

test('COLLYBUS - Update Spot', () => {
    // Creating event with custom data fields
    let updateSpotEvent = createUpdateSpotEvent(TOKEN, SPOT);

    // Creating an empty CollybusSpot entity
    createCollybusSpotIfNonExistent(Address.fromString(TOKEN), Address.fromString(COLLYBUS_TOKEN_ADDRESS));

    // Once we have our entity ^ created and saved in the store, when executing the event handler below
    // it is going to find by 'id' that entity, and it's going to update it's fields "spot", "collybus"
    handleCollybusUpdateSpot(updateSpotEvent);

    // Building the 'id' that CollybusSpot is using
    const id = COLLYBUS_TOKEN_ADDRESS.toLowerCase() + "-" + TOKEN.toLowerCase();

    // Checking if the 'spot' and 'collybus' fields are updated with the data when 'handleCollybusUpdateSpot' was executed
    assert.fieldEquals("CollybusSpot", id, "spot", SPOT.toString());
    assert.fieldEquals("CollybusSpot", id, "collybus", COLLYBUS_TOKEN_ADDRESS.toLowerCase());

    clearStore();
})

test('COLLYBUS - Update Discount Rate', () => {
    // Creating event with custom data fields
    let updateDiscountRate = createUpdateDiscountRateEvent(DISCOUNT_RATE, RATE_ID);

    // Creating an empty CollybusRate entity
    createCollybusRateIfNonExistent(Address.fromString(COLLYBUS_TOKEN_ADDRESS), RATE_ID);

    // Once we have our entity ^ created and saved in the store, when executing the event handler below
    // it is going to find by 'id' that entity, and it's going to update it's fields "rateId", "discountRate" and "collybus"
    handleCollybusUpdateDiscountRate(updateDiscountRate);

    // Building the 'id' that CollybusRate is using
    const id = COLLYBUS_TOKEN_ADDRESS.toLowerCase() + "-" + RATE_ID.toHexString();

    // Checking if the 'discountRate', 'rateId' and 'collybus' fields are updated with the data when 'handleCollybusUpdateSpot' was executed
    assert.fieldEquals("CollybusDiscountRate", id, "rateId", RATE_ID.toString());
    assert.fieldEquals("CollybusDiscountRate", id, "discountRate", DISCOUNT_RATE.toString());
    assert.fieldEquals("CollybusDiscountRate", id, "collybus", COLLYBUS_TOKEN_ADDRESS.toLowerCase());

    clearStore();
})

function createUpdateSpotEvent(tokenAddr: string, spotAmount: BigInt): UpdateSpot {
    let updateSpotEvent = changetype<UpdateSpot>(newMockEvent());
    updateSpotEvent.parameters = new Array();
    updateSpotEvent.address = Address.fromString(COLLYBUS_TOKEN_ADDRESS);

    // Convert and init our params
    let token = new ethereum.EventParam("token", ethereum.Value.fromAddress(Address.fromString(tokenAddr)));
    let spot = new ethereum.EventParam("spot", ethereum.Value.fromSignedBigInt(spotAmount));

    // Attach the fields to the event's parameter
    updateSpotEvent.parameters.push(token);
    updateSpotEvent.parameters.push(spot);

    return updateSpotEvent;
}

function createUpdateDiscountRateEvent(discountRate: BigInt, rateIdentifier: BigInt): UpdateDiscountRate {
    let updateDiscountRateEvent = changetype<UpdateDiscountRate>(newMockEvent());
    updateDiscountRateEvent.parameters = new Array();
    updateDiscountRateEvent.address = Address.fromString(COLLYBUS_TOKEN_ADDRESS);

    // Convert and init our params
    let rate = new ethereum.EventParam("rate", ethereum.Value.fromSignedBigInt(discountRate));
    let rateId = new ethereum.EventParam("rateId", ethereum.Value.fromSignedBigInt(rateIdentifier));

    // Attach the fields to the event's parameter
    updateDiscountRateEvent.parameters.push(rateId);
    updateDiscountRateEvent.parameters.push(rate);

    return updateDiscountRateEvent;
}