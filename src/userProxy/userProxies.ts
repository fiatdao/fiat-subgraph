import { Bytes } from "@graphprotocol/graph-ts";
import { DeployProxy } from "../../generated/PRBProxyFactory/PRBProxyFactory";
import { UserProxy } from "../../generated/schema";

export function handleDeployProxy(event: DeployProxy): void {
  let userAddress = event.params.owner;
  let proxyAddress = event.params.proxy;
  createUserProxyIfNonExistent(userAddress, proxyAddress);
}

export function createUserProxyIfNonExistent(userAddress: Bytes, proxyAddress: Bytes): UserProxy {
  let address = userAddress.toHexString();
  let userProxy = UserProxy.load(address);
  if (userProxy == null) {
    userProxy = new UserProxy(address);
  }
  userProxy.userAddress = userAddress;
  userProxy.proxyAddress = proxyAddress;
  userProxy.save();
  return userProxy as UserProxy;
}
