"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const LinkedAccount_controller_1 = __importDefault(require("../controllers/LinkedAccount.controller"));
const LinkedAccount_validator_1 = require("../validators/LinkedAccount.validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// User routes
router.get('/user/:userId', auth_1.authenticate, LinkedAccount_controller_1.default.getUserLinkedAccounts);
router.post('/', auth_1.authenticate, LinkedAccount_validator_1.validateLinkedAccount, LinkedAccount_controller_1.default.createLinkedAccount);
router.put('/:id', auth_1.authenticate, LinkedAccount_validator_1.validateLinkedAccount, LinkedAccount_controller_1.default.updateLinkedAccount);
router.delete('/:id', auth_1.authenticate, LinkedAccount_controller_1.default.deleteLinkedAccount);
// Admin routes
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), LinkedAccount_controller_1.default.getAllLinkedAccounts);
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), LinkedAccount_controller_1.default.getLinkedAccountById);
router.get('/account/:accountId', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), LinkedAccount_controller_1.default.getAccountLinkedAccounts);
exports.default = router;
