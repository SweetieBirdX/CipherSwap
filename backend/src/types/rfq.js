"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RFQ_CONSTANTS = exports.ExecutionStatus = exports.RFQResponseStatus = exports.RFQStatus = void 0;
var RFQStatus;
(function (RFQStatus) {
    RFQStatus["PENDING"] = "pending";
    RFQStatus["QUOTED"] = "quoted";
    RFQStatus["EXPIRED"] = "expired";
    RFQStatus["CANCELLED"] = "cancelled";
    RFQStatus["EXECUTED"] = "executed";
    RFQStatus["FAILED"] = "failed";
})(RFQStatus || (exports.RFQStatus = RFQStatus = {}));
var RFQResponseStatus;
(function (RFQResponseStatus) {
    RFQResponseStatus["PENDING"] = "pending";
    RFQResponseStatus["ACCEPTED"] = "accepted";
    RFQResponseStatus["REJECTED"] = "rejected";
    RFQResponseStatus["EXPIRED"] = "expired";
    RFQResponseStatus["EXECUTED"] = "executed";
    RFQResponseStatus["FAILED"] = "failed";
})(RFQResponseStatus || (exports.RFQResponseStatus = RFQResponseStatus = {}));
var ExecutionStatus;
(function (ExecutionStatus) {
    ExecutionStatus["PENDING"] = "pending";
    ExecutionStatus["CONFIRMED"] = "confirmed";
    ExecutionStatus["FAILED"] = "failed";
    ExecutionStatus["CANCELLED"] = "cancelled";
})(ExecutionStatus || (exports.ExecutionStatus = ExecutionStatus = {}));
exports.RFQ_CONSTANTS = {
    MAX_REQUESTS_PER_USER: 100,
    MAX_AMOUNT: '1000000000000000000000000', // 1M tokens
    MIN_AMOUNT: '1000000000000000000', // 1 token
    REQUEST_EXPIRY_TIME: 5 * 60 * 1000, // 5 minutes
    QUOTE_VALIDITY_TIME: 2 * 60 * 1000, // 2 minutes
    MAX_ALLOWED_RESOLVERS: 20,
    DEFAULT_SLIPPAGE: 0.5,
    MAX_SLIPPAGE: 5.0,
    MIN_RESPONSE_TIME: 1000, // 1 second
    MAX_RESPONSE_TIME: 30000 // 30 seconds
};
