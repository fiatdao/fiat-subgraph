import { FIAT, FIATTokenBalance, FIATTokenAllowance } from "../generated/schema";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Transfer, Approval } from "../generated/Fiat/Fiat";
import { BIGINT_ZERO, getTotalSupply, getBalance, ZERO_ADDRESS } from "./utils";

export function handleFIATTransfer(event: Transfer): void {
  let fromAddress = event.params.from;
  let toAddress = event.params.to;
  let amount = event.params.amount;
  let fiat = createFIATIfNonExistent(event.address);

  // Checking if the event that is coming is from mint() 
  if (isMintOperation(fromAddress, toAddress)) {
    fiat.minted = fiat.minted!.plus(amount);
  }
  // Checking if the even that is coming is from burn() 
  else if (isBurnOperation(fromAddress, toAddress)) {
    fiat.burned = fiat.burned!.plus(amount);
  }

  fiat.totalSupply = getTotalSupply();
  fiat.save();

  // Getting balance of the two addresses and saving them in their entities
  let balanceFrom = getBalance(fromAddress);
  let balanceTo = getBalance(toAddress);
  createFIATTokenBalanceIfNonExistent(fromAddress, balanceFrom);
  createFIATTokenBalanceIfNonExistent(toAddress, balanceTo);
}

export function createFIATIfNonExistent(address: Address): FIAT {
  let id = address.toHexString();
  let fiat = FIAT.load(id);

  if (!fiat) {
    fiat = new FIAT(id);
    fiat.address = address;
    fiat.burned = BIGINT_ZERO;
    fiat.minted = BIGINT_ZERO;
    fiat.totalSupply = BIGINT_ZERO;
    fiat.save();
  }
  return fiat as FIAT;
}

export function createFIATTokenBalanceIfNonExistent(address: Address, balance: BigInt = BIGINT_ZERO): void {
  if (address.notEqual(ZERO_ADDRESS)) {
    let id = address.toHexString();
    let fiatTokenBalance = FIATTokenBalance.load(id);

    if (!fiatTokenBalance) {
      fiatTokenBalance = new FIATTokenBalance(id);
      fiatTokenBalance.address = address;
    }
    fiatTokenBalance.balance = balance;
    fiatTokenBalance.save();
  }
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

function createFIATTokenAllowanceIfNonExistent(owner: Address, spender: Address, amount: BigInt): void {
  if (owner.notEqual(ZERO_ADDRESS) && spender.notEqual(ZERO_ADDRESS)) {
    let id = owner.toHexString() + "-" + spender.toHexString();
    let allowanceData = FIATTokenAllowance.load(id);

    if (!allowanceData) {
      allowanceData = new FIATTokenAllowance(id);
      allowanceData.owner = owner;
      allowanceData.spender = spender;
    }

    allowanceData.amount = amount;
    allowanceData.save();
  }
}