import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { Notional, Notional__getCurrencyResult } from "../generated/Notional/Notional";
import { VaultFC } from "../generated/Notional/VaultFC";
import { Collateral, Vault } from "../generated/schema";
import { createVaultIfNonExistent } from "./vault/vaults";
import { vaultsData } from "./vault/vaultsData";
import { BIGINT_ZERO, getFaceValue, getMaturity, getSymbol, getToken, getUnderlierToken, getVaultType } from "./utils";

const NOTIONAL = "NOTIONAL";
const NOTIONAL_COLLATERAL_TYPE = "fCash";
const VAULT_TYPE_ERC20 = "ERC20";

export function createCollateralIfNecessary(vault: Vault): Collateral | null {
  let typeHex = getVaultType(changetype<Address>(vault.address!));
  let type = Bytes.fromHexString(typeHex).toString();

  if (type.includes(VAULT_TYPE_ERC20)) {
    return createERC20CollateralIfNonExistent(vault);
  }
  return null;
}

export function createERC20CollateralIfNonExistent(vault: Vault): Collateral {
  let tokenId = "0";
  let vaultAddress = changetype<Address>(vault.address!);
  let collateral = createCollateralIfNonExistent(vault, tokenId);
  let tokenAddress = getToken(vaultAddress);
  let underlierAddress = getUnderlierToken(vaultAddress);

  collateral.maturity = getMaturity(vaultAddress, BigInt.fromString(tokenId));
  setCollateralAddresses(collateral, tokenAddress, underlierAddress);
  collateral.save();
  return collateral as Collateral;
}

export function createNotionalCollateralIfNonExistent(notional: Notional, tokenId: BigInt, currencyId: i32, maturity: BigInt, tenor: BigInt): Collateral {
  let id = tokenId.toString();

  let collateral: Collateral;
  let vault: Vault;
  let currency: Notional__getCurrencyResult;

  // look for corresponding vault
  for (let i: i32 = 0; i < vaultsData.entries.length; i++) {
    let vData = vaultsData.get(vaultsData.entries[i].key);

    // only notional vaults
    let vaultType = vData!.get('type');
    if (vaultsData.entries[i].key !== "" && vaultType !== null && vaultType === NOTIONAL) {
      currency = notional.getCurrency(currencyId);
      let marketUnderlierAddress = currency.value1.tokenAddress;

      let vaultFC = VaultFC.bind(changetype<Address>(Address.fromHexString(vaultsData.entries[i].key)))
      let vaultUnderlier = vaultFC.underlierToken()
      let vaultTenor = vaultFC.tenor()

      // same underlier and tenor
      if (vaultUnderlier.equals(marketUnderlierAddress) && vaultTenor.equals(tenor)) {
        vault = createVaultIfNonExistent(vaultsData.entries[i].key);
        let collateral = createCollateralIfNonExistent(vault, id);
        if (!collateral.address) {
          collateral.maturity = maturity;
          setCollateralAddresses(collateral, notional._address, marketUnderlierAddress);
          collateral.save();
        }
      }
    }
  }


  return collateral as Collateral;
}

export function createCollateralIfNonExistent(vault: Vault, tokenId: string): Collateral {
  let id = vault.id + "-" + tokenId;
  let collateral = Collateral.load(id);
  if (!collateral) {
    collateral = new Collateral(id);
    collateral.tokenId = BigInt.fromString(tokenId);
    collateral.depositedCollateral = BIGINT_ZERO;
    collateral.vault = vault.id;
    collateral.vaultName = vault.name;
    collateral.faceValue = getFaceValue();
    collateral.save();
  }
  return collateral as Collateral;
}

export function updateCollateral(collateral: Collateral, deltaCollateral: BigInt): void {
  collateral.depositedCollateral = collateral.depositedCollateral!.plus(deltaCollateral);
  collateral.save();
}

export function setCollateralAddresses(collateral: Collateral, collateralAddress: Address | null, underlierAddress: Address | null): void {
  collateral.address = collateralAddress;
  collateral.symbol = getSymbol(collateralAddress);
  collateral.underlierAddress = underlierAddress;
  collateral.underlierSymbol = getSymbol(underlierAddress);
}
