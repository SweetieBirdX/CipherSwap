"use strict";
// Predicate related type definitions - Eyüp's responsibility
Object.defineProperty(exports, "__esModule", { value: true });
exports.CHAINLINK_ORACLES = exports.PREDICATE_CONSTANTS = exports.PredicateErrorCodes = exports.PredicateStatus = void 0;
var PredicateStatus;
(function (PredicateStatus) {
    PredicateStatus["ACTIVE"] = "active";
    PredicateStatus["EXPIRED"] = "expired";
    PredicateStatus["INVALID"] = "invalid";
    PredicateStatus["EXECUTED"] = "executed";
    PredicateStatus["CANCELLED"] = "cancelled";
})(PredicateStatus || (exports.PredicateStatus = PredicateStatus = {}));
var PredicateErrorCodes;
(function (PredicateErrorCodes) {
    PredicateErrorCodes["INVALID_ORACLE"] = "INVALID_ORACLE";
    PredicateErrorCodes["INVALID_TOLERANCE"] = "INVALID_TOLERANCE";
    PredicateErrorCodes["PREDICATE_NOT_FOUND"] = "PREDICATE_NOT_FOUND";
    PredicateErrorCodes["PREDICATE_EXPIRED"] = "PREDICATE_EXPIRED";
    PredicateErrorCodes["NETWORK_ERROR"] = "NETWORK_ERROR";
    PredicateErrorCodes["INVALID_CHAIN_ID"] = "INVALID_CHAIN_ID";
    PredicateErrorCodes["ORACLE_TIMEOUT"] = "ORACLE_TIMEOUT";
})(PredicateErrorCodes || (exports.PredicateErrorCodes = PredicateErrorCodes = {}));
// Constants
exports.PREDICATE_CONSTANTS = {
    MAX_TOLERANCE: 10, // 10%
    MIN_TOLERANCE: 0.1, // 0.1%
    DEFAULT_TOLERANCE: 1, // 1%
    DEFAULT_TIMEOUT: 30000, // 30 seconds
    MAX_PREDICATE_HISTORY: 100,
    ORACLE_UPDATE_INTERVAL: 60000 // 1 minute
};
// Chainlink Oracle Addresses (Mainnet)
exports.CHAINLINK_ORACLES = {
    1: {
        'ETH/USD': '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
        'BTC/USD': '0xF4030086522a5bEEa5E49b0311D971b50Ff9b538',
        'USDC/USD': '0x8fFfFfd4AfB6115b954Bd326cbe7B4BA576818f6',
        'DAI/USD': '0xAed0c38402a5d19df6E4c03F4E2DceD6e29c1ee9'
    },
    137: {
        'ETH/USD': '0xF9680D99D6C9589e2a93a78A04A279e509205945',
        'BTC/USD': '0xDE31F8bFBD8c84b5360CFACCa3539B938dd78ae6',
        'USDC/USD': '0xfE4A8cc5b5B2366C1B58Bea3858e81843581b2F7'
    },
    42161: {
        'ETH/USD': '0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612',
        'BTC/USD': '0x6ce185860a496310F6C54D98eaaB54831c2Af31d'
    }
};
