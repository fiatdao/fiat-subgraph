import { handleDeployProxy } from "./userProxy"
import {
  handleModifyCollateralAndDebt,
  handleTransferCollateralAndDebt,
  handleConfiscateCollateralAndDebt
} from "./position"
import { handleVaultInit, } from "./vault/vaults"
import { handleCollybusSetParam, handlerCollybusUpdateSpot} from "./collybus"
import { handleMarketsInitialized } from "./notional"
import { handleFIATTransfer, handleFIATApprovals } from "./fiat"
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
  handleFIATTransfer,
  handleFIATApprovals,
  handleCollybusSetParam,
  handlerCollybusUpdateSpot,
  handleStartAuction,
  handleTakeCollateral,
  handleStopAuction,
  handleRedoAuction,
  handleAuctionSetParam,
  handlePublicanSetParam,
  handleCCPoolCreated,
}
