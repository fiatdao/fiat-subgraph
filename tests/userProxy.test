// import { DeployProxy } from "../generated/PRBProxyFactory/PRBProxyFactory";
// import { UserProxy } from '../generated/schema';
// import { handleDeployProxy, createUserProxyIfNonExistent } from "../src/userProxy";
// import { Address, ethereum } from '@graphprotocol/graph-ts'
// import { test, assert, newMockEvent } from 'matchstick-as/assembly/index'

// const PRB_PROXY_FACTORY_ADDRESS = "0x87ca60e2c2545ae94c9fb850daf670a91685933d"; // PRB_PROXY_FACTORY deployed on goerli
// const OWNER = "0x0D3ff0A8672fcA127aA6DbE44BBcc935821Fdc7b";
// const PROXY_ADDRESS = "0xF80fe9AC3FCA0b44288CBdA6D6F633aff4Da9A3C";

// test('USER-PROXY_TEST - Deploy Proxy', () => {
//     // Creating event with custom data fields
//     let deployProxyEvent: DeployProxy = createDeployProxyEvent(OWNER, PROXY_ADDRESS);

//     // Creating a mocked entity which will compare it later on at the asserts
//     let mockedProxyDeployEntity: UserProxy = createUserProxyIfNonExistent(Address.fromString(OWNER), Address.fromString(PROXY_ADDRESS));

//     // Once created above ^ we will have that entity, so the handler loads it and updates it
//     handleDeployProxy(deployProxyEvent);

//     // We check if the addreses we created in `createUserProxyIfNonExistent` are the same as the `handleDeployProxy` created
//     assert.fieldEquals("UserProxy", mockedProxyDeployEntity.owner.toString(), "owner", OWNER.toLowerCase());
//     assert.fieldEquals("UserProxy", mockedProxyDeployEntity.owner.toString(), "proxyAddress", PROXY_ADDRESS.toLowerCase());
// })

// function createDeployProxyEvent(ownerAddr: string, proxyAddr: string): DeployProxy {
//     let deployProxyEvent = changetype<DeployProxy>(newMockEvent());
//     deployProxyEvent.parameters = new Array();
//     deployProxyEvent.address = Address.fromString(PRB_PROXY_FACTORY_ADDRESS);

//     // // Convert and init our params
//     let owner = new ethereum.EventParam("owner", ethereum.Value.fromAddress(Address.fromString(ownerAddr)));
//     let proxy = new ethereum.EventParam("proxy", ethereum.Value.fromAddress(Address.fromString(proxyAddr)));

//     // // Attach the fields to the event's parameter
//     deployProxyEvent.parameters.push(owner);
//     deployProxyEvent.parameters.push(proxy);

//     return deployProxyEvent;
// }