"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ORDERBOOK_CONSTANTS = exports.OrderStatus = void 0;
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "pending";
    OrderStatus["ACTIVE"] = "active";
    OrderStatus["FILLED"] = "filled";
    OrderStatus["CANCELLED"] = "cancelled";
    OrderStatus["EXPIRED"] = "expired";
    OrderStatus["FAILED"] = "failed";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
exports.ORDERBOOK_CONSTANTS = {
    MAX_ORDERS_PER_USER: 50,
    MAX_ORDER_SIZE: '1000000000000000000000000', // 1M tokens
    MIN_ORDER_SIZE: '1000000000000000000', // 1 token
    ORDER_EXPIRY_TIME: 24 * 60 * 60 * 1000, // 24 hours
    MAX_ALLOWED_SENDERS: 10,
    DEFAULT_SLIPPAGE: 0.5,
    MAX_SLIPPAGE: 5.0
};
