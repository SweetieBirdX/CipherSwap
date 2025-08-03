"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logDebug = exports.logWarn = exports.logError = exports.logInfo = exports.stream = exports.logger = void 0;
var winston = require("winston");
// Create logger instance
exports.logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
    }), winston.format.errors({ stack: true }), winston.format.json()),
    defaultMeta: { service: 'cipherswap-api' },
    transports: [
        // Console transport
        new winston.transports.Console({
            format: winston.format.combine(winston.format.colorize(), winston.format.simple())
        }),
        // File transport for errors
        new winston.transports.File({
            filename: 'logs/error.log',
            level: 'error'
        }),
        // File transport for all logs
        new winston.transports.File({
            filename: 'logs/combined.log'
        })
    ]
});
// Create a stream object for Morgan
exports.stream = {
    write: function (message) {
        exports.logger.info(message.trim());
    }
};
// Helper functions
var logInfo = function (message, meta) {
    exports.logger.info(message, meta);
};
exports.logInfo = logInfo;
var logError = function (message, error) {
    exports.logger.error(message, { error: (error === null || error === void 0 ? void 0 : error.message) || error, stack: error === null || error === void 0 ? void 0 : error.stack });
};
exports.logError = logError;
var logWarn = function (message, meta) {
    exports.logger.warn(message, meta);
};
exports.logWarn = logWarn;
var logDebug = function (message, meta) {
    exports.logger.debug(message, meta);
};
exports.logDebug = logDebug;
exports.default = exports.logger;
