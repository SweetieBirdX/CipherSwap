"use strict";
// Quote related type definitions - Eyüp's responsibility
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUOTE_CONSTANTS = exports.QuoteErrorCodes = void 0;
var QuoteErrorCodes;
(function (QuoteErrorCodes) {
    QuoteErrorCodes["INVALID_TOKENS"] = "INVALID_TOKENS";
    QuoteErrorCodes["INSUFFICIENT_LIQUIDITY"] = "INSUFFICIENT_LIQUIDITY";
    QuoteErrorCodes["HIGH_SLIPPAGE"] = "HIGH_SLIPPAGE";
    QuoteErrorCodes["RATE_LIMIT_EXCEEDED"] = "RATE_LIMIT_EXCEEDED";
    QuoteErrorCodes["NETWORK_ERROR"] = "NETWORK_ERROR";
    QuoteErrorCodes["INVALID_AMOUNT"] = "INVALID_AMOUNT";
})(QuoteErrorCodes || (exports.QuoteErrorCodes = QuoteErrorCodes = {}));
// Constants
exports.QUOTE_CONSTANTS = {
    MAX_SLIPPAGE: 50, // 50%
    MIN_AMOUNT: '0.0001', // 0.0001 ETH
    MAX_AMOUNT: '1000000', // 1M ETH
    DEFAULT_SLIPPAGE: 0.5, // 0.5%
    QUOTE_CACHE_DURATION: 30000, // 30 seconds
    MAX_QUOTE_HISTORY: 100
};
