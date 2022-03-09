import { Fiat, FiatTokenBalance, FiatTokenAllowance } from "../generated/schema";
import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Transfer, Approval } from "../generated/Fiat/Fiat";
import { BIGINT_ZERO, getTotalSupply, ZERO_ADDRESS } from "./utils";

export function handleFiatTransfer(event: Transfer): void {
  let fromAddress = event.params.from;
  let toAddress = event.params.to;
  let amount = event.params.amount;
  let fiat = createFiatIfNonExistent(event.address);
  let balanceFrom = createFiatTokenBalanceIfNonExistent(fromAddress);
  let balanceTo = createFiatTokenBalanceIfNonExistent(toAddress);

  if (isMintOperation(fromAddress, toAddress)) {
    fiat.minted = fiat.minted!.plus(amount);
    balanceTo.balance = balanceTo.balance!.plus(amount);
  } else { // If it's not mint() this is transferFrom() and burn() case
    fiat.burned = fiat.burned!.plus(amount);
    balanceFrom.balance = balanceFrom.balance!.minus(amount)

    // On the transferFrom() and burn() we perform allowance changes as well:
    let to = event.transaction.from // message sender
    // we load the entity if we have it, otherwise we create it, and save the changed amount
    createFiatTokenAllowanceIfNonExistent(fromAddress, to, amount)
  }

  fiat.totalSupply = getTotalSupply();

  fiat.save();
  balanceFrom.save();
  balanceTo.save();
}

export function createFiatTokenBalanceIfNonExistent(address: Address): FiatTokenBalance {
  let id = address.toHexString();
  let fiatTokenBalance = FiatTokenBalance.load(id);

  if (!fiatTokenBalance) {
    fiatTokenBalance = new FiatTokenBalance(id);
    fiatTokenBalance.address = address;
    fiatTokenBalance.balance = BIGINT_ZERO;
    fiatTokenBalance.save();
  }
  return fiatTokenBalance as FiatTokenBalance;
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

export function handleFiatApprovals(event: Approval): void {
  const owner = event.params.owner;
  const spender = event.params.spender;
  const amount = event.params.amount;

  createFiatTokenAllowanceIfNonExistent(owner, spender, amount);
}

function createFiatTokenAllowanceIfNonExistent(owner: Address, spender: Address, amount: BigInt): FiatTokenAllowance {
  let id = owner.toHexString() + "-" + spender.toHexString();
  let allowanceData = FiatTokenAllowance.load(id);

  if (!allowanceData) {
    allowanceData = new FiatTokenAllowance(id);
    allowanceData.owner = owner;
    allowanceData.spender = spender;
    allowanceData.amount = BIGINT_ZERO;
  }

  allowanceData.amount = amount;
  allowanceData.save();

  return allowanceData as FiatTokenAllowance;
}
