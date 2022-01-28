import { Address, BigInt, Bytes, TypedMap } from "@graphprotocol/graph-ts";
import { Notional } from "../generated/Notional/Notional";
import { ERC20 } from "../generated/Notional/ERC20";
import { Collateral, Vault } from "../generated/schema";
import { createVaultIfNonExistent } from "./vault/vaults";
import { VAULT_NOTIONAL_ADDRESS } from "./constants";

const ELEMENT = "ELEMENT";
const NOTIONAL_COLLATERAL_TYPE = "fCash"

export function createCollateralIfNecessary(vault: Vault, config: TypedMap<string, string>): void {
  if (vault.name === ELEMENT) {
    let underlierToken = (config.get('underlierToken')) as string;
    let collateral = Collateral.load(underlierToken!);

    if (!collateral) {
      collateral = new Collateral(underlierToken!);
      collateral.name = (config.get('name')) as string;
      collateral.type = (config.get('collateralType')) as string;
      let maturity = config.get('collateralMaturity') as string;
      if (maturity !== "") {
        collateral.maturity = BigInt.fromString(maturity);
      }
      collateral.underlierName = (config.get('underlierName')) as string;
      collateral.underlierAddress = Address.fromString(config.get('underlierAddress') as string);
      collateral.vault = vault.id;
      collateral.save();
    }
  }
}

export function createNotionalCollateralIfNonExistent(notional: Notional, currencyId: i32, maturity: BigInt): Collateral {
  let id = currencyId.toString() + "-" + maturity.toString();
  let collateral = Collateral.load(id);
  if (!collateral) {
    let collateral = new Collateral(id);
    let currency = notional.getCurrency(currencyId);
    let tokenAddress = currency.value0.tokenAddress;
    let underlierAddress = currency.value1.tokenAddress;
    let tokenAsset = ERC20.bind(tokenAddress);
    let tokenName = tokenAsset.symbol();
    let collateralName = tokenName + "-" + maturity.toString();

    collateral.address = tokenAddress;
    collateral.name = collateralName;
    collateral.maturity = maturity;
    if (underlierAddress !== null) {
      collateral.underlierAddress = underlierAddress;
      let underlierAsset = ERC20.bind(underlierAddress);
      let underlierName = underlierAsset.try_symbol()
      if (!underlierName.reverted) {
        collateral.underlierName = underlierName.value;
      }
    }
    collateral.type = NOTIONAL_COLLATERAL_TYPE;
    createVaultIfNonExistent(VAULT_NOTIONAL_ADDRESS);
    collateral.vault = VAULT_NOTIONAL_ADDRESS;
    collateral.save();
  }
  return collateral as Collateral;
}
