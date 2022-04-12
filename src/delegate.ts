import { Address } from "@graphprotocol/graph-ts";
import { Delegate } from "../generated/schema";
import { Codex as CodexContract, GrantDelegate, RevokeDelegate } from "../generated/Codex/Codex";
import { createUserIfNonExistent } from "./user";

export function handleGrantDelegate(event: GrantDelegate): void {
  let delegates = createDelegateIfNotExistent(event.params.delegator, event.params.delegatee);
  let codex = CodexContract.bind(event.address);
  delegates.hasDelegate = codex.delegates(event.params.delegator, event.params.delegatee);
  delegates.save();
}

export function handleRevokeDelegate(event: RevokeDelegate): void {
  let codex = CodexContract.bind(event.address);
  let delegates = createDelegateIfNotExistent(event.params.delegator, event.params.delegator);
  delegates.hasDelegate = codex.delegates(event.params.delegator, event.params.delegatee);
  delegates.save();
}

function createDelegateIfNotExistent(delegator: Address, delegatee: Address): Delegate {
  let id = delegator.toHexString() + "-" + delegatee.toHexString();
  let delegates = Delegate.load(id);

  if (delegates == null) {
    delegates = new Delegate(id);
    delegates.delegator = createUserIfNonExistent(delegator).id;
    delegates.delegatee = createUserIfNonExistent(delegatee).id;
    delegates.save();
  }

  return delegates as Delegate;
}