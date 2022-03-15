import { SetParam1, UpdateSpot } from "../generated/Codex/Collybus";
import { createVaultIfNonExistent } from "./vault/vaults";
import { getCollateralizationRatio } from "./utils";
import { CollybusSpot, Collybus } from "../generated/schema";
import { Address } from "@graphprotocol/graph-ts";

export function handleCollybusSetParam(setParam: SetParam1): void {
    let vaultAddress = setParam.params.vault;
    let collybusAddress = setParam.address;

    let collybus = createCollybusIfNonExistent(collybusAddress);
    let vault = createVaultIfNonExistent(vaultAddress.toHexString());
    vault.collateralizationRatio = getCollateralizationRatio(vaultAddress);
    vault.collybus = collybus.id;
    vault.save();
}

export function handlerCollybusUpdateSpot(event: UpdateSpot): void {
    let spot = event.params.spot;
    let token = event.params.token;
    let collybusAddress = event.address;

    let collybus = createCollybusIfNonExistent(collybusAddress);
    let collybusSpot = createCollybusSpotIfNonExistent(token);
    collybusSpot.spot = spot;
    collybusSpot.collybus = collybus.id;
    collybusSpot.save();
}

function createCollybusSpotIfNonExistent(token: Address): CollybusSpot {
    let id = token.toHexString();
    let collybusSpot = CollybusSpot.load(id);

    if (!collybusSpot) {
        collybusSpot = new CollybusSpot(id);
        collybusSpot.token = token;

        collybusSpot.save();
    }

    return collybusSpot;
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