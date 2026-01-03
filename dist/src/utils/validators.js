"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginValidator = exports.registerValidator = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidator = [
    (0, express_validator_1.body)('email').isEmail(),
    (0, express_validator_1.body)('password').isLength({ min: 6 }),
    (0, express_validator_1.body)('firstName').notEmpty(),
    (0, express_validator_1.body)('lastName').notEmpty(),
];
exports.loginValidator = [(0, express_validator_1.body)('email').isEmail(), (0, express_validator_1.body)('password').notEmpty()];
