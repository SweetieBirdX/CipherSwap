"use strict";
// Swap related type definitions - Eyüp's responsibility
Object.defineProperty(exports, "__esModule", { value: true });
exports.BundleStatus = exports.SWAP_CONSTANTS = exports.SwapErrorCodes = exports.EscrowStatus = exports.SecretStatus = exports.LimitOrderStatus = exports.SwapStatus = void 0;
var SwapStatus;
(function (SwapStatus) {
    SwapStatus["PENDING"] = "pending";
    SwapStatus["CONFIRMED"] = "confirmed";
    SwapStatus["FAILED"] = "failed";
    SwapStatus["CANCELLED"] = "cancelled";
    SwapStatus["EXPIRED"] = "expired";
})(SwapStatus || (exports.SwapStatus = SwapStatus = {}));
var LimitOrderStatus;
(function (LimitOrderStatus) {
    LimitOrderStatus["PENDING"] = "pending";
    LimitOrderStatus["EXECUTED"] = "executed";
    LimitOrderStatus["CANCELLED"] = "cancelled";
    LimitOrderStatus["EXPIRED"] = "expired";
    LimitOrderStatus["FAILED"] = "failed";
})(LimitOrderStatus || (exports.LimitOrderStatus = LimitOrderStatus = {}));
var SecretStatus;
(function (SecretStatus) {
    SecretStatus["PENDING"] = "pending";
    SecretStatus["SUBMITTED"] = "submitted";
    SecretStatus["CONFIRMED"] = "confirmed";
    SecretStatus["FAILED"] = "failed";
    SecretStatus["EXPIRED"] = "expired";
})(SecretStatus || (exports.SecretStatus = SecretStatus = {}));
var EscrowStatus;
(function (EscrowStatus) {
    EscrowStatus["PENDING"] = "pending";
    EscrowStatus["READY"] = "ready";
    EscrowStatus["EXPIRED"] = "expired";
    EscrowStatus["COMPLETED"] = "completed";
    EscrowStatus["FAILED"] = "failed";
})(EscrowStatus || (exports.EscrowStatus = EscrowStatus = {}));
var SwapErrorCodes;
(function (SwapErrorCodes) {
    SwapErrorCodes["INVALID_TOKENS"] = "INVALID_TOKENS";
    SwapErrorCodes["INSUFFICIENT_LIQUIDITY"] = "INSUFFICIENT_LIQUIDITY";
    SwapErrorCodes["HIGH_SLIPPAGE"] = "HIGH_SLIPPAGE";
    SwapErrorCodes["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    SwapErrorCodes["NETWORK_ERROR"] = "NETWORK_ERROR";
    SwapErrorCodes["INVALID_AMOUNT"] = "INVALID_AMOUNT";
    SwapErrorCodes["SWAP_NOT_FOUND"] = "SWAP_NOT_FOUND";
    SwapErrorCodes["SWAP_EXPIRED"] = "SWAP_EXPIRED";
    SwapErrorCodes["UNAUTHORIZED_CANCEL"] = "UNAUTHORIZED_CANCEL";
    SwapErrorCodes["ESCROW_NOT_READY"] = "ESCROW_NOT_READY";
    SwapErrorCodes["SECRET_INVALID"] = "SECRET_INVALID";
    SwapErrorCodes["SECRET_EXPIRED"] = "SECRET_EXPIRED";
})(SwapErrorCodes || (exports.SwapErrorCodes = SwapErrorCodes = {}));
// Constants
exports.SWAP_CONSTANTS = {
    MAX_SLIPPAGE: 50, // 50%
    MIN_AMOUNT: '100000000000000', // 0.0001 ETH in wei
    MAX_AMOUNT: '1000000000000000000000000', // 1M ETH in wei
    DEFAULT_SLIPPAGE: 0.5, // 0.5%
    DEFAULT_DEADLINE: 1800, // 30 minutes
    SWAP_CACHE_DURATION: 30000, // 30 seconds
    MAX_SWAP_HISTORY: 100,
    ESCROW_CHECK_INTERVAL: 5000, // 5 seconds
    SECRET_SUBMISSION_TIMEOUT: 60000, // 60 seconds
    MAX_ESCROW_WAIT_TIME: 300000 // 5 minutes
};
var BundleStatus;
(function (BundleStatus) {
    BundleStatus["PENDING"] = "pending";
    BundleStatus["SUBMITTED"] = "submitted";
    BundleStatus["CONFIRMED"] = "confirmed";
    BundleStatus["FAILED"] = "failed";
    BundleStatus["EXPIRED"] = "expired";
    BundleStatus["REVERTED"] = "reverted";
})(BundleStatus || (exports.BundleStatus = BundleStatus = {}));
