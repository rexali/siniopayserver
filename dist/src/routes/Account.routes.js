"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Account_controller_1 = __importDefault(require("../controllers/Account.controller"));
const Account_validator_1 = require("../validators/Account.validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// User routes (authenticated users can access their own accounts)
router.get('/my-accounts', auth_1.authenticate, Account_controller_1.default.getUserAccounts);
// Admin routes
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), Account_controller_1.default.getAllAccounts);
router.get('/:id', auth_1.authenticate, Account_controller_1.default.getAccountById); // Users can view if they own it
router.get('/account/:accountNumber', auth_1.authenticate, Account_controller_1.default.getAccountByAccountNumber); // Users can view if they own it
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), Account_validator_1.validateAccount, Account_controller_1.default.createAccount);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), Account_validator_1.validateAccount, Account_controller_1.default.updateAccount);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['super_admin']), Account_controller_1.default.deleteAccount);
router.put('/:id/balance', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), Account_validator_1.validateBalanceUpdate, Account_controller_1.default.updateBalance);
// Get accounts by user ID
router.get('/user/:userId', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), Account_controller_1.default.getUserAccounts);
exports.default = router;
