import { handleDeployProxy } from "./userProxy"
import {
  handleModifyCollateralAndDebt,
  handleTransferCollateralAndDebt,
  handleConfiscateCollateralAndDebt } from "./position"
import { handleVaultInit, handleCollybusSetParam } from "./vault/vaults"
import { handleMarketsInitialized } from "./notional"
import { handleFiatTransfer } from "./fiat"
import { handleStartAuction, handleTakeCollateral, handleStopAuction, handleRedoAuction, handleAuctionSetParam } from "./auctions"
import { handlePublicanSetParam } from "./publican"
import { handleCCPoolCreated } from "./ccpFactory"

export {
  handleDeployProxy,
  handleModifyCollateralAndDebt,
  handleTransferCollateralAndDebt,
  handleConfiscateCollateralAndDebt,
  handleVaultInit,
  handleMarketsInitialized,
  handleFiatTransfer,
  handleCollybusSetParam,
  handleStartAuction,
  handleTakeCollateral,
  handleStopAuction,
  handleRedoAuction,
  handleAuctionSetParam,
  handlePublicanSetParam,
  handleCCPoolCreated,
}
