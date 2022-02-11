import { Address } from "@graphprotocol/graph-ts";
import { Transfer } from "../generated/Fiat/Fiat";
import { FiatData } from "../generated/schema";
import { BIGINT_ZERO, getTotalSupply, ZERO_ADDRESS } from "./utils";

export function handleFiatTransfer(event: Transfer): void {
  let fromAddress = event.params.from;
  let toAddress = event.params.to;
  let amount = event.params.amount;
  let fiatData = createFiatDataIfNonExistent(event.address);

  if (isMintOperation(fromAddress, toAddress)) {
    fiatData.minted = fiatData.minted.plus(amount);
  } else {
    fiatData.burned = fiatData.burned.plus(amount);
  }
  fiatData.totalSupply = getTotalSupply();
  fiatData.save();
}

export function createFiatDataIfNonExistent(address: Address): FiatData {
  let id = address.toHexString();
  let fiatData = FiatData.load(id);

  if (!fiatData) {
    fiatData = new FiatData(id);
    fiatData.address = address;
    fiatData.burned = BIGINT_ZERO;
    fiatData.minted = BIGINT_ZERO;
    fiatData.totalSupply = getTotalSupply();
    fiatData.save();
  }
  return fiatData as FiatData;
}

export function isMintOperation(from: Address, to: Address): boolean {
  return from.equals(ZERO_ADDRESS) && !to.equals(ZERO_ADDRESS);
}
