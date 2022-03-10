import { Bytes } from "@graphprotocol/graph-ts";
import { DeployProxy } from "../generated/PRBProxyFactory/PRBProxyFactory";
import { UserProxy } from "../generated/schema";

export function handleDeployProxy(event: DeployProxy): void {
  let owner = event.params.owner;
  let proxyAddress = event.params.proxy;
  createUserProxyIfNonExistent(owner, proxyAddress);
}

export function createUserProxyIfNonExistent(owner: Bytes, proxyAddress: Bytes): UserProxy {
  let address = owner.toHexString();
  let userProxy = UserProxy.load(address);
  if (userProxy == null) {
    userProxy = new UserProxy(address);
  }
  userProxy.owner = owner;
  userProxy.proxyAddress = proxyAddress;
  userProxy.save();
  return userProxy as UserProxy;
}
