import { Bytes, BigInt } from "@graphprotocol/graph-ts";
import { User } from "../generated/schema";

export function createUserIfNonExistent(address: Bytes): User {
  let id = address.toHexString();

  let user = User.load(id);
  if (user == null) {
    user = new User(id);
    user.address = address;
    user.credit = BigInt.fromI32(0);
    user.save();
  }

  return user as User;
}
