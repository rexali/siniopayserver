"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const FAQ_controller_1 = __importDefault(require("../controllers/FAQ.controller"));
const FAQ_validator_1 = require("../validators/FAQ.validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/', FAQ_controller_1.default.getAllFAQs);
router.get('/categories', FAQ_controller_1.default.getFAQCategories);
router.get('/search', FAQ_controller_1.default.searchFAQs);
router.get('/:id', FAQ_controller_1.default.getFAQById);
// Admin routes
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), FAQ_validator_1.validateFAQ, FAQ_controller_1.default.createFAQ);
router.put('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), FAQ_validator_1.validateFAQ, FAQ_controller_1.default.updateFAQ);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['super_admin']), FAQ_controller_1.default.deleteFAQ);
router.post('/reorder', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), FAQ_validator_1.validateFAQReorder, FAQ_controller_1.default.reorderFAQs);
exports.default = router;
