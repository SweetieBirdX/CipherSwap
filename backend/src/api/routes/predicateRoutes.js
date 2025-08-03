"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var predicateController_1 = require("../controllers/predicateController");
var router = (0, express_1.Router)();
var predicateController = new predicateController_1.default();
/**
 * @route   POST /api/predicate/create
 * @desc    Create a new price predicate
 * @access  Public
 */
router.post('/predicate/create', predicateController.createPredicate.bind(predicateController));
/**
 * @route   GET /api/predicate/validate/:id
 * @desc    Validate predicate with current oracle price
 * @access  Public
 */
router.get('/predicate/validate/:id', predicateController.validatePredicate.bind(predicateController));
/**
 * @route   GET /api/predicate/history
 * @desc    Get predicate history for user
 * @access  Public
 */
router.get('/predicate/history', predicateController.getPredicateHistory.bind(predicateController));
/**
 * @route   GET /api/predicate/oracles
 * @desc    Get available Chainlink oracles for chain
 * @access  Public
 */
router.get('/predicate/oracles', predicateController.getAvailableOracles.bind(predicateController));
/**
 * @route   POST /api/predicate/cancel/:id
 * @desc    Cancel active predicate
 * @access  Public
 */
router.post('/predicate/cancel/:id', predicateController.cancelPredicate.bind(predicateController));
/**
 * @route   GET /api/predicate/status/:id
 * @desc    Get predicate status and details
 * @access  Public
 */
router.get('/predicate/status/:id', predicateController.getPredicateStatus.bind(predicateController));
exports.default = router;
