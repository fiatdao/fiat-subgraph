import { Address } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/Fiat/Fiat";
import { Fiat } from "../generated/schema";
import { BIGINT_ZERO, getTotalSupply, ZERO_ADDRESS } from "./utils";

export function handleFiatTransfer(event: Transfer): void {
  let fromAddress = event.params.from;
  let toAddress = event.params.to;
  let amount = event.params.amount;
  let fiat = createFiatIfNonExistent(event.address);

  if (isMintOperation(fromAddress, toAddress)) {
    fiat.minted = fiat.minted!.plus(amount);
  } else {
    fiat.burned = fiat.burned!.plus(amount);
  }
  fiat.totalSupply = getTotalSupply();
  fiat.save();
}

export function createFiatIfNonExistent(address: Address): Fiat {
  let id = address.toHexString();
  let fiat = Fiat.load(id);

  if (!fiat) {
    fiat = new Fiat(id);
    fiat.address = address;
    fiat.burned = BIGINT_ZERO;
    fiat.minted = BIGINT_ZERO;
    fiat.totalSupply = getTotalSupply();
    fiat.save();
  }
  return fiat as Fiat;
}

export function isMintOperation(from: Address, to: Address): boolean {
  return from.equals(ZERO_ADDRESS) && !to.equals(ZERO_ADDRESS);
}
