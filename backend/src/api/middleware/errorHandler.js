"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitError = exports.UnauthorizedError = exports.NotFoundError = exports.ValidationError = exports.errorHandler = void 0;
var logger_1 = require("../../utils/logger");
var errorHandler = function (error, req, res, next) {
    // Log error
    logger_1.logger.error('API Error:', {
        error: error.message,
        stack: error.stack,
        url: req.url,
        method: req.method,
        body: req.body,
        params: req.params,
        query: req.query,
        userAgent: req.get('User-Agent'),
        ip: req.ip
    });
    // Determine status code
    var statusCode = error.statusCode || 500;
    // Create error response
    var errorResponse = {
        success: false,
        error: error.message || 'Internal server error',
        code: error.code || 'INTERNAL_ERROR',
        timestamp: Date.now(),
        path: req.url,
        method: req.method
    };
    // Add stack trace in development
    if (process.env.NODE_ENV === 'development') {
        errorResponse.stack = error.stack;
    }
    res.status(statusCode).json(errorResponse);
};
exports.errorHandler = errorHandler;
// Custom error classes
var ValidationError = /** @class */ (function (_super) {
    __extends(ValidationError, _super);
    function ValidationError(message) {
        var _this = _super.call(this, message) || this;
        _this.statusCode = 400;
        _this.code = 'VALIDATION_ERROR';
        _this.name = 'ValidationError';
        return _this;
    }
    return ValidationError;
}(Error));
exports.ValidationError = ValidationError;
var NotFoundError = /** @class */ (function (_super) {
    __extends(NotFoundError, _super);
    function NotFoundError(message) {
        if (message === void 0) { message = 'Resource not found'; }
        var _this = _super.call(this, message) || this;
        _this.statusCode = 404;
        _this.code = 'NOT_FOUND';
        _this.name = 'NotFoundError';
        return _this;
    }
    return NotFoundError;
}(Error));
exports.NotFoundError = NotFoundError;
var UnauthorizedError = /** @class */ (function (_super) {
    __extends(UnauthorizedError, _super);
    function UnauthorizedError(message) {
        if (message === void 0) { message = 'Unauthorized'; }
        var _this = _super.call(this, message) || this;
        _this.statusCode = 401;
        _this.code = 'UNAUTHORIZED';
        _this.name = 'UnauthorizedError';
        return _this;
    }
    return UnauthorizedError;
}(Error));
exports.UnauthorizedError = UnauthorizedError;
var RateLimitError = /** @class */ (function (_super) {
    __extends(RateLimitError, _super);
    function RateLimitError(message) {
        if (message === void 0) { message = 'Rate limit exceeded'; }
        var _this = _super.call(this, message) || this;
        _this.statusCode = 429;
        _this.code = 'RATE_LIMIT_EXCEEDED';
        _this.name = 'RateLimitError';
        return _this;
    }
    return RateLimitError;
}(Error));
exports.RateLimitError = RateLimitError;
exports.default = exports.errorHandler;
