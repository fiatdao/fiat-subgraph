import { SetParam1, SetParam2, UpdateSpot, UpdateDiscountRate } from "../generated/Codex/Collybus";
import { createVaultIfNonExistent } from "./vault/vaults";
import { CollybusSpot, Collybus, CollybusDiscountRate } from "../generated/schema";
import { Address, BigInt } from "@graphprotocol/graph-ts";

export function handleCollybusSetParam1(event: SetParam1): void {
    let vault = createVaultIfNonExistent(event.params.vault.toHexString());

    if (event.params.param.toString() == "liquidationRatio") {
        vault.collateralizationRatio = event.params.data;
    }
    if (event.params.param.toString() == "defaultRateId") {
        vault.defaultRateId = event.params.data;
    }

    vault.save();
}

export function handleCollybusSetParam2(event: SetParam2): void {
    // TODO
}

export function handleCollybusUpdateSpot(event: UpdateSpot): void {
    let collybus = createCollybusIfNonExistent(event.address);
    let collybusSpot = createCollybusSpotIfNonExistent(event.params.token, event.address);

    collybusSpot.spot = event.params.spot;
    collybusSpot.collybus = collybus.id;

    collybusSpot.save();
}

export function handleCollybusUpdateDiscountRate(event: UpdateDiscountRate): void {
    let collybus = createCollybusIfNonExistent(event.address);
    let collybusRate = createCollybusRateIfNonExistent(event.address, event.params.rateId);

    collybusRate.rateId = event.params.rateId;
    collybusRate.discountRate = event.params.rate;
    collybusRate.collybus = collybus.id;

    collybusRate.save();
}

function createCollybusSpotIfNonExistent(token: Address, collybusAddress: Address): CollybusSpot {
    let id = collybusAddress.toHexString() + "-" + token.toHexString();

    let collybusSpot = CollybusSpot.load(id);
    if (collybusSpot == null) {
        collybusSpot = new CollybusSpot(id);
        collybusSpot.token = token;
        collybusSpot.save();
    }

    return collybusSpot as CollybusSpot;
}

function createCollybusRateIfNonExistent(collybusAddress: Address, rateId: BigInt): CollybusDiscountRate {
    let id = collybusAddress.toHexString() + "-" + rateId.toHexString();

    let collybusRate = CollybusDiscountRate.load(id);
    if (collybusRate == null) {
        collybusRate = new CollybusDiscountRate(id);
        collybusRate.save();
    }

    return collybusRate as CollybusDiscountRate;
}

function createCollybusIfNonExistent(address: Address): Collybus {
    let id = address.toHexString();

    let collybus = Collybus.load(id);
    if (collybus == null) {
        collybus = new Collybus(id);
        collybus.save();
    }

    return collybus;
}