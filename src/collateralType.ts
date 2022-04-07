import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
// import { Notional, Notional__getCurrencyResult } from "../generated/Notional/Notional";
// import { VaultFC } from "../generated/Notional/VaultFC";
import { CollateralType, Vault } from "../generated/schema";
// import { createVaultIfNonExistent } from "./vault/vaults";
// import { vaultsData } from "./vault/vaultsData";
import { BIGINT_ZERO, getFaceValue, getMaturity, getSymbol, getToken, getUnderlierToken, getVaultType, getUnderlierScale } from "./utils";

const NOTIONAL = "NOTIONAL";
const NOTIONAL_COLLATERAL_TYPE = "fCash";
const VAULT_TYPE_ERC20 = "ERC20";

export function createCollateralIfNecessary(vault: Vault): CollateralType | null {
  let typeHex = getVaultType(changetype<Address>(vault.address!));
  let type = Bytes.fromHexString(typeHex).toString();

  if (type.includes(VAULT_TYPE_ERC20)) {
    return createERC20CollateralIfNonExistent(vault);
  }
  return null;
}

export function createERC20CollateralIfNonExistent(vault: Vault): CollateralType {
  let tokenId = "0";
  let vaultAddress = changetype<Address>(vault.address!);
  let collateralType = createCollateralIfNonExistent(vault, tokenId);
  let tokenAddress = getToken(vaultAddress);
  let underlierAddress = getUnderlierToken(vaultAddress);

  collateralType.maturity = getMaturity(vaultAddress, BigInt.fromString(tokenId));
  setCollateralAddresses(collateralType, tokenAddress, underlierAddress);

  if (vault.type === "ELEMENT") {
    collateralType.eptData = tokenAddress!.toHexString();
  }

  collateralType.save();
  return collateralType as CollateralType;
}

// export function createNotionalCollateralIfNonExistent(notional: Notional, tokenId: BigInt, currencyId: i32, maturity: BigInt, tenor: BigInt): CollateralType {
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
//         let collateralType = createCollateralIfNonExistent(vault, id);
//         if (!collateralType.address) {
//           collateralType.maturity = maturity;
//           setCollateralAddresses(collateralType, notional._address, marketUnderlierAddress);
//           collateralType.save();
//         }
//       }
//     }
//   }

//   return collateralType as CollateralType;
// }

export function createCollateralIfNonExistent(vault: Vault, tokenId: string): CollateralType {
  let id = vault.id + "-" + tokenId;
  let collateralType = CollateralType.load(id);
  if (!collateralType) {
    collateralType = new CollateralType(id);
    collateralType.tokenId = BigInt.fromString(tokenId);
    collateralType.depositedCollateral = BIGINT_ZERO;
    collateralType.vault = vault.id;
    collateralType.vaultName = vault.name;
    collateralType.faceValue = getFaceValue();
    collateralType.underlierScale = getUnderlierScale(changetype<Address>(vault.address!));
    collateralType.save();
  }
  return collateralType as CollateralType;
}

export function updateCollateral(collateralType: CollateralType, deltaCollateral: BigInt): void {
  collateralType.depositedCollateral = collateralType.depositedCollateral!.plus(deltaCollateral);
  collateralType.save();
}

export function setCollateralAddresses(collateralType: CollateralType, collateralAddress: Address | null, underlierAddress: Address | null): void {
  collateralType.address = collateralAddress;
  collateralType.symbol = getSymbol(collateralAddress);
  collateralType.underlierAddress = underlierAddress;
  collateralType.underlierSymbol = getSymbol(underlierAddress);
}
