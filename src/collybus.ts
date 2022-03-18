import { SetParam1, UpdateSpot, UpdateDiscountRate } from "../generated/Codex/Collybus";
import { createVaultIfNonExistent } from "./vault/vaults";
import { getCollateralizationRatio } from "./utils";
import { CollybusSpot, Collybus, CollybusDiscountRates } from "../generated/schema";
import { Address, BigInt } from "@graphprotocol/graph-ts";

export function handleCollybusSetParam(setParam: SetParam1): void {
    let vaultAddress = setParam.params.vault;
    let collybusAddress = setParam.address;

    let collybus = createCollybusIfNonExistent(collybusAddress);
    let vault = createVaultIfNonExistent(vaultAddress.toHexString());
    vault.collateralizationRatio = getCollateralizationRatio(vaultAddress);
    vault.collybus = collybus.id;
    vault.save();
}

export function handleCollybusUpdateSpot(event: UpdateSpot): void {
    let spot = event.params.spot;
    let token = event.params.token;
    let collybusAddress = event.address;

    let collybus = createCollybusIfNonExistent(collybusAddress);
    let collybusSpot = createCollybusSpotIfNonExistent(token, collybusAddress);
    collybusSpot.spot = spot;
    collybusSpot.collybus = collybus.id;
    collybusSpot.save();
}

export function handleDiscountRate(event: UpdateDiscountRate): void {
    // rateId is from the discount rate feed
    let rateId = event.params.rateId;
    let discountRate = event.params.rate;
    let collybusAddress = event.address;

    let collybus = createCollybusIfNonExistent(collybusAddress);
    let collybusRate = createCollybusRateIfNonExistent(collybusAddress, rateId);
    collybusRate.rateId = rateId;
    collybusRate.discountRate = discountRate;
    collybusRate.collybus = collybus.id;
    collybusRate.save();
}

function createCollybusSpotIfNonExistent(token: Address, collybusAddress: Address): CollybusSpot {
    let id = collybusAddress.toHexString() + "-" + token.toHexString();
    let collybusSpot = CollybusSpot.load(id);

    if (!collybusSpot) {
        collybusSpot = new CollybusSpot(id);
        collybusSpot.token = token;

        collybusSpot.save();
    }

    return collybusSpot as CollybusSpot;
}

function createCollybusRateIfNonExistent(collybusAddress: Address, rateId: BigInt): CollybusDiscountRates {
    let id = collybusAddress.toHexString() + "-" + rateId.toHexString();
    let collybusRate = CollybusDiscountRates.load(id);

    if (!collybusRate) {
        collybusRate = new CollybusDiscountRates(id);
        collybusRate.save();
    }

    return collybusRate as CollybusDiscountRates;
}

function createCollybusIfNonExistent(address: Address): Collybus {
    let id = address.toHexString();
    let collybus = Collybus.load(id);

    if (!collybus) {
        collybus = new Collybus(id);
        collybus.save();
    }

    return collybus;
}