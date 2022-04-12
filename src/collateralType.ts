import { BigInt, Address } from "@graphprotocol/graph-ts";
import { CollateralType, Vault } from "../generated/schema";
import { IVault as IVaultContract } from "../generated/Codex/IVault";
import { ERC20 as ERC20Contract } from "../generated/Codex/ERC20";
import { VAULT_CONFIG } from "./generated/config";
import { createEPTDataIfNonExistent } from "./element";
import { BIGINT_ZERO, WAD } from "./utils";
// import { Notional, Notional__getCurrencyResult } from "../generated/Notional/Notional";
// import { VaultFC } from "../generated/Notional/VaultFC";
// import { createVaultIfNonExistent } from "./vault/vaults";

// const NOTIONAL = "NOTIONAL";
// const NOTIONAL_COLLATERAL_TYPE = "fCash";
// const VAULT_TYPE_ERC20 = "ERC20";

export function createCollateralTypeIfNonExistent(vault: Vault, tokenId: BigInt): CollateralType {
  let id = vault.id + "-" + tokenId.toString();
  let collateralType = CollateralType.load(id);
  if (!collateralType) {
    collateralType = new CollateralType(id);
    collateralType.tokenId = tokenId;
    collateralType.depositedCollateral = BIGINT_ZERO;
    collateralType.vault = vault.id;
    collateralType.vaultName = vault.name;
    collateralType.faceValue = WAD;

    let iVault = IVaultContract.bind(Address.fromBytes(vault.address!));
    let token = ERC20Contract.bind(iVault.token());
    let underlier = ERC20Contract.bind(iVault.underlierToken());

    collateralType.address = token._address;
    collateralType.symbol = token.symbol();
    collateralType.scale = iVault.tokenScale();
    collateralType.underlierAddress = underlier._address;
    collateralType.underlierSymbol = underlier.symbol();
    collateralType.underlierScale = iVault.underlierScale();
    collateralType.maturity = iVault.maturity(tokenId);

    collateralType.save();
  }

  let config = VAULT_CONFIG.get(vault.address!.toHexString());
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
//   for (let i: i32 = 0; i < VAULT_CONFIG.entries.length; i++) {
//     let vData = VAULT_CONFIG.get(VAULT_CONFIG.entries[i].key);

//     // only notional vaults
//     let vaultType = vData!.get('type');
//     if (VAULT_CONFIG.entries[i].key !== "" && vaultType !== null && vaultType === NOTIONAL) {
//       currency = notional.getCurrency(currencyId);
//       let marketUnderlierAddress = currency.value1.tokenAddress;

//       let vaultFC = VaultFC.bind(changetype<Address>(Address.fromHexString(VAULT_CONFIG.entries[i].key)))
//       let vaultUnderlier = vaultFC.underlierToken()
//       let vaultTenor = vaultFC.tenor()

//       // same underlier and tenor
//       if (vaultUnderlier.equals(marketUnderlierAddress) && vaultTenor.equals(tenor)) {
//         vault = createVaultIfNonExistent(VAULT_CONFIG.entries[i].key);
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
