import { handleDeployProxy } from "./userProxy"
import {
  handleModifyCollateralAndDebt,
  handleTransferCollateralAndDebt,
  handleConfiscateCollateralAndDebt
} from "./position"
import { handleVaultInit, handleCollybusSetParam } from "./vault/vaults"
import { handleMarketsInitialized } from "./notional"
import { handleFIATTransfer, handleFIATApprovals } from "./fiat"
import { handleStartAuction, handleTakeCollateral, handleStopAuction, handleRedoAuction, handleAuctionSetParam } from "./auctions"
import { handlePublicanSetParam } from "./publican"
import { handleCCPoolCreated } from "./ccpFactory"
import {
  handleGrantDelegate,
  handleRevokeDelegate,
  handleLock,
  handleModifyBalance,
  handleTransferBalance,
  handleSetParam
} from "./codex"

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
  handleStartAuction,
  handleTakeCollateral,
  handleStopAuction,
  handleRedoAuction,
  handleAuctionSetParam,
  handlePublicanSetParam,
  handleCCPoolCreated,
  handleGrantDelegate,
  handleRevokeDelegate,
  handleLock,
  handleModifyBalance,
  handleTransferBalance,
  handleSetParam
}
