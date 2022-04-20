import { DeployProxy } from "../generated/PRBProxyFactory/PRBProxyFactory";
import { handleDeployProxy } from "../src/userProxy";
import { Address, ethereum } from '@graphprotocol/graph-ts'
import { test, assert, newMockEvent, afterEach, clearStore } from 'matchstick-as/assembly/index'

const PRB_PROXY_FACTORY_ADDRESS = "0xf0d4B8b15bF511E7c7071a5EFEfD85a5a4B86Db5"; // PRB_PROXY_FACTORY deployed on goerli
const OWNER = "0x0D3ff0A8672fcA127aA6DbE44BBcc935821Fdc7b";
const PROXY_ADDRESS = "0xF80fe9AC3FCA0b44288CBdA6D6F633aff4Da9A3C";

afterEach(() => {
    clearStore();
});

test('USER-PROXY - Deploy Proxy', () => {
    // Creating event with custom data fields
    let deployProxyEvent: DeployProxy = createDeployProxyEvent(OWNER, PROXY_ADDRESS);

    // The handler creates the entity
    handleDeployProxy(deployProxyEvent);

    // We check if the addreses passed in the event are the same as the `handleDeployProxy` created
    assert.fieldEquals("UserProxy", OWNER.toLowerCase(), "owner", OWNER.toLowerCase());
    assert.fieldEquals("UserProxy", OWNER.toLowerCase(), "proxyAddress", PROXY_ADDRESS.toLowerCase());
})

function createDeployProxyEvent(ownerAddr: string, proxyAddr: string): DeployProxy {
    let deployProxyEvent = changetype<DeployProxy>(newMockEvent());
    deployProxyEvent.parameters = new Array();
    deployProxyEvent.address = Address.fromString(PRB_PROXY_FACTORY_ADDRESS);

    // Convert and init our params
    let owner = new ethereum.EventParam("owner", ethereum.Value.fromAddress(Address.fromString(ownerAddr)));
    let proxy = new ethereum.EventParam("proxy", ethereum.Value.fromAddress(Address.fromString(proxyAddr)));

    // We also need to create the params that are not used by our event handler, but the contract passes them
    let origin = new ethereum.EventParam("origin", ethereum.Value.fromAddress(Address.fromString("0xAee76900C2e433B84abd55d859fC6B8a99c12074")));
    let deployer = new ethereum.EventParam("deployer", ethereum.Value.fromAddress(Address.fromString("0x72f6F3A76C3dc56841883C8fC19626Ff78BBEeB2")));
    let seed = new ethereum.EventParam("seed", ethereum.Value.fromBytes(Address.fromString("0x418778d8AeEe24005479169c87C16e4fb2bc0e2c")));
    let salt = new ethereum.EventParam("salt", ethereum.Value.fromBytes(Address.fromString("0xd703f975EAE17E9A0AA3D6c86C1A83213f7615A2")));

    // Attach the fields to the event's parameter
    // We need to attach them exactly on the index on which 'param' is looking for them
    // for example see /generated/PRBProxyFactory/PRBProxyFactory.ts [0-5] index on the getters - 
    // so we need to pass them the same order and type, as it expects it
    deployProxyEvent.parameters.push(origin);   // Address - 0
    deployProxyEvent.parameters.push(deployer); // Address - 1
    deployProxyEvent.parameters.push(owner);    // Address - 2
    deployProxyEvent.parameters.push(seed);     // Bytes - 3
    deployProxyEvent.parameters.push(salt);     // Bytes - 4
    deployProxyEvent.parameters.push(proxy);    // Address - 5

    return deployProxyEvent;
}