"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var swagger_1 = require("../../config/swagger");
var swagger_ui_express_1 = require("swagger-ui-express");
var docsRouter = (0, express_1.Router)();
// Serve swagger documentation
var swaggerSetup = swagger_ui_express_1.setup(swagger_1.specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
        persistAuthorization: true,
        docExpansion: 'list',
        filter: true
    }
});
// @ts-ignore: Type issues with swagger-ui-express
docsRouter.use('/', __spreadArray(__spreadArray([], swagger_ui_express_1.serve, true), [swaggerSetup], false));
exports.default = docsRouter;
