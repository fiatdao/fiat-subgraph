import { FIAT, FIATTokenBalance, FIATTokenAllowance } from "../generated/schema";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Transfer, Approval } from "../generated/Fiat/Fiat";
import { BIGINT_ZERO, getTotalSupply, ZERO_ADDRESS } from "./utils";

export function handleFIATTransfer(event: Transfer): void {
  let fromAddress = event.params.from;
  let toAddress = event.params.to;
  let amount = event.params.amount;
  let fiat = createFIATIfNonExistent(event.address);
  let balanceFrom = createFIATTokenBalanceIfNonExistent(fromAddress);
  let balanceTo = createFIATTokenBalanceIfNonExistent(toAddress);

  // Checking if the event that is coming is from mint() 
  if (isMintOperation(fromAddress, toAddress)) {
    fiat.minted = fiat.minted!.plus(amount);
    balanceTo.balance = balanceTo.balance!.plus(amount);
  }
  // Checking if the even that is coming is from burn() 
  if (isBurnOperation(fromAddress, toAddress)) {
    fiat.burned = fiat.burned!.plus(amount);
    balanceFrom.balance = balanceFrom.balance!.minus(amount);

    // On the burn() we perform allowance changes as well:
    // we load the entity if we have it, otherwise we create it, and save the incoming amount
    let to = event.transaction.from // message sender
    createFIATTokenAllowanceIfNonExistent(fromAddress, to, amount)
  } else { // If it's not mint() or burn(), it is from transferFrom()
    balanceFrom.balance = balanceFrom.balance.minus(amount);
    balanceTo.balance = balanceTo.balance.plus(amount);

    // On the transferFrom() we perform allowance changes as well:
    // we load the entity if we have it, otherwise we create it, and save the incoming amount
    let to = event.transaction.from // message sender
    createFIATTokenAllowanceIfNonExistent(fromAddress, to, amount);
  }

  fiat.totalSupply = getTotalSupply();

  fiat.save();
  balanceFrom.save();
  balanceTo.save();
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
  return fiatTokenBalance as FIATTokenBalance;
}

export function createFIATIfNonExistent(address: Address): FIAT {
  let id = address.toHexString();
  let fiat = FIAT.load(id);

  if (!fiat) {
    fiat = new FIAT(id);
    fiat.address = address;
    fiat.burned = BIGINT_ZERO;
    fiat.minted = BIGINT_ZERO;
    fiat.totalSupply = getTotalSupply();
    fiat.save();
  }
  return fiat as FIAT;
}

export function isMintOperation(from: Address, to: Address): boolean {
  return from.equals(ZERO_ADDRESS) && !to.equals(ZERO_ADDRESS);
}

export function isBurnOperation(from: Address, to: Address): boolean {
  return from.notEqual(ZERO_ADDRESS) && to.equals(ZERO_ADDRESS);
}

export function handleFIATApprovals(event: Approval): void {
  const owner = event.params.owner;
  const spender = event.params.spender;
  const amount = event.params.amount;

  createFIATTokenAllowanceIfNonExistent(owner, spender, amount);
}

function createFIATTokenAllowanceIfNonExistent(owner: Address, spender: Address, amount: BigInt): FIATTokenAllowance {
  let id = owner.toHexString() + "-" + spender.toHexString();
  let allowanceData = FIATTokenAllowance.load(id);

  if (!allowanceData) {
    allowanceData = new FIATTokenAllowance(id);
    allowanceData.owner = owner;
    allowanceData.spender = spender;
    allowanceData.amount = BIGINT_ZERO;
  }

  allowanceData.amount = amount;
  allowanceData.save();

  return allowanceData as FIATTokenAllowance;
}
