import { Address, BigInt, log } from "@graphprotocol/graph-ts";
import { CollateralType, Vault } from "../generated/schema";
import { vaultsData } from "./vault/vaultsData";
import { createEPTDataIfNonExistent } from "./element";
import {
  BIGINT_ZERO, getFaceValue, getMaturity, getSymbol, getToken, getUnderlierToken, getUnderlierScale, getTokenScale
} from "./utils";
// import { Notional, Notional__getCurrencyResult } from "../generated/Notional/Notional";
// import { VaultFC } from "../generated/Notional/VaultFC";
// import { createVaultIfNonExistent } from "./vault/vaults";

// const NOTIONAL = "NOTIONAL";
// const NOTIONAL_COLLATERAL_TYPE = "fCash";
// const VAULT_TYPE_ERC20 = "ERC20";

export function createCollateralTypeIfNonExistent(vault: Vault, tokenId: string): CollateralType {
  log.debug("createCollateralTypeIfNonExistent: vaultAddress: {}, {} ", [vault.id, vault.address!.toHexString()]);

  let id = vault.id + "-" + tokenId;
  let collateralType = CollateralType.load(id);
  if (!collateralType) {
    collateralType = new CollateralType(id);
    collateralType.tokenId = BigInt.fromString(tokenId);
    collateralType.depositedCollateral = BIGINT_ZERO;
    collateralType.vault = vault.id;
    collateralType.vaultName = vault.name;
    collateralType.faceValue = getFaceValue();
    collateralType.save();
  }

  let config = vaultsData.get(vault.address!.toHexString());
  if (config) {
    if (((config.get('type')) as string) == "ELEMENT") {
      createEPTCollateralTypeIfNonExistent(collateralType);
    } else if (((config.get('type')) as string) == "NOTIONAL") {
      // createNotionalCollateralTypeIfNonExistent(vault, tokenId);
    }
  }

  return collateralType as CollateralType;
}

function createEPTCollateralTypeIfNonExistent(collateralType: CollateralType): CollateralType {
  let tokenId = "0";
  let vaultAddress = Address.fromString(collateralType.vault!);
  let tokenAddress = getToken(vaultAddress);
  let underlierAddress = getUnderlierToken(vaultAddress);

  collateralType.address = tokenAddress;
  collateralType.symbol = getSymbol(tokenAddress);
  collateralType.scale = getTokenScale(vaultAddress);
  collateralType.underlierAddress = underlierAddress;
  collateralType.underlierSymbol = getSymbol(underlierAddress);
  collateralType.underlierScale = getUnderlierScale(vaultAddress);

  collateralType.maturity = getMaturity(vaultAddress, BigInt.fromString(tokenId));
  collateralType.eptData = createEPTDataIfNonExistent(collateralType.vault!).id;
  collateralType.save();

  return collateralType as CollateralType;
}

// TODO
// export function createNotionalCollateralTypeIfNonExistent(notional: Notional, tokenId: BigInt, currencyId: i32, maturity: BigInt, tenor: BigInt): CollateralType {
//   let id = tokenId.toString();

//   let collateralType: CollateralType;
//   let vault: Vault;
//   let currency: Notional__getCurrencyResult;

//   // look for corresponding vault
//   for (let i: i32 = 0; i < vaultsData.entries.length; i++) {
//     let vData = vaultsData.get(vaultsData.entries[i].key);

//     // only notional vaults
//     let vaultType = vData!.get('type');
//     if (vaultsData.entries[i].key !== "" && vaultType !== null && vaultType === NOTIONAL) {
//       currency = notional.getCurrency(currencyId);
//       let marketUnderlierAddress = currency.value1.tokenAddress;

//       let vaultFC = VaultFC.bind(changetype<Address>(Address.fromHexString(vaultsData.entries[i].key)))
//       let vaultUnderlier = vaultFC.underlierToken()
//       let vaultTenor = vaultFC.tenor()

//       // same underlier and tenor
//       if (vaultUnderlier.equals(marketUnderlierAddress) && vaultTenor.equals(tenor)) {
//         vault = createVaultIfNonExistent(vaultsData.entries[i].key);
//         let collateralType = createCollateralTypeIfNonExistent(vault, id);
//         if (!collateralType.address) {
//           collateralType.maturity = maturity;
//           collateralType.address = notional._address;
//           collateralType.symbol = getSymbol(notional._address);
//           collateralType.underlierAddress = marketUnderlierAddress;
//           collateralType.underlierSymbol = getSymbol(marketUnderlierAddress);
//           collateralType.save();
//         }
//       }
//     }
//   }

//   return collateralType as CollateralType;
// }

export function updateCollateral(collateralType: CollateralType, deltaCollateral: BigInt): void {
  collateralType.depositedCollateral = collateralType.depositedCollateral!.plus(deltaCollateral);
  collateralType.save();
}
