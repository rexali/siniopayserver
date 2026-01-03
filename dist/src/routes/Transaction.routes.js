"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Transaction_controller_1 = __importDefault(require("../controllers/Transaction.controller"));
const Transaction_validator_1 = require("../validators/Transaction.validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// User routes
router.post('/', auth_1.authenticate, Transaction_validator_1.validateTransaction, Transaction_controller_1.default.createTransaction);
router.get('/account/:accountId', auth_1.authenticate, Transaction_controller_1.default.getAccountTransactions);
// Admin routes
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), Transaction_controller_1.default.getAllTransactions);
router.get('/:id', auth_1.authenticate, Transaction_controller_1.default.getTransactionById);
router.get('/users/:id', auth_1.authenticate, Transaction_controller_1.default.getTransactionsByUser);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), Transaction_validator_1.validateTransaction, Transaction_controller_1.default.updateTransaction);
exports.default = router;
