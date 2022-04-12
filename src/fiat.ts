import { Address, BigInt } from "@graphprotocol/graph-ts";
import { FIAT, FIATTokenBalance, FIATTokenAllowance } from "../generated/schema";
import { FIAT as FIATContract, Transfer, Approval } from "../generated/FIAT/FIAT";
import { BIGINT_ZERO, ZERO_ADDRESS } from "./utils";

export function isMintOperation(from: Address, to: Address): boolean {
  return from.equals(ZERO_ADDRESS) && !to.equals(ZERO_ADDRESS);
}

export function isBurnOperation(from: Address, to: Address): boolean {
  return from.notEqual(ZERO_ADDRESS) && to.equals(ZERO_ADDRESS);
}

export function handleFIATTransfer(event: Transfer): void {
  let fiat = createFIATIfNonExistent(event.address);

  // Checking if the event that is coming is from mint() 
  if (isMintOperation(event.params.from, event.params.to)) {
    fiat.minted = fiat.minted!.plus(event.params.value);
  }
  // Checking if the even that is coming is from burn() 
  else if (isBurnOperation(event.params.from, event.params.to)) {
    fiat.burned = fiat.burned!.plus(event.params.value);
  }

  fiat.save();

  let fromObject = createFIATTokenBalanceIfNonExistent(event.params.from);
  fromObject.balance = fromObject.balance!.minus(event.params.value);
  fromObject.save();

  let toObject = createFIATTokenBalanceIfNonExistent(event.params.to);
  toObject.balance = toObject.balance!.plus(event.params.value);
  toObject.save();
}

export function createFIATIfNonExistent(address: Address): FIAT {
  let fiatContract = FIATContract.bind(address);

  let fiat = FIAT.load(address.toHexString());
  if (fiat == null) {
    fiat = new FIAT(address.toHexString());
    fiat.address = address;
    fiat.burned = BIGINT_ZERO;
    fiat.minted = BIGINT_ZERO;
    fiat.totalSupply = fiatContract.totalSupply();
    fiat.save();
  }

  return fiat as FIAT;
}

export function createFIATTokenBalanceIfNonExistent(address: Address): FIATTokenBalance {
  let id = address.toHexString();
  let fiatTokenBalance = FIATTokenBalance.load(id);

  if (!fiatTokenBalance) {
    fiatTokenBalance = new FIATTokenBalance(id);
    fiatTokenBalance.address = address;
    fiatTokenBalance.balance = BIGINT_ZERO;
    fiatTokenBalance.save();
  }

  return fiatTokenBalance;
}

export function handleFIATApprovals(event: Approval): void {
  createFIATAllowanceIfNonExistent(event.params.owner, event.params.spender, event.params.value);
}

export function createFIATAllowanceIfNonExistent(owner: Address, spender: Address, amount: BigInt): void {
  if (owner.notEqual(ZERO_ADDRESS) && spender.notEqual(ZERO_ADDRESS)) {
    let id = owner.toHexString() + "-" + spender.toHexString();
    
    let allowanceData = FIATTokenAllowance.load(id);
    if (allowanceData == null) {
      allowanceData = new FIATTokenAllowance(id);
      allowanceData.owner = owner;
      allowanceData.spender = spender;
    }

    allowanceData.amount = amount;
    allowanceData.save();
  }
}