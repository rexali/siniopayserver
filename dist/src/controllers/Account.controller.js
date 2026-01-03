"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Account_model_1 = __importDefault(require("../models/Account.model"));
const Profile_model_1 = __importDefault(require("../models/Profile.model"));
const express_validator_1 = require("express-validator");
const User_model_1 = __importDefault(require("../models/User.model"));
const Transaction_model_1 = __importDefault(require("../models/Transaction.model"));
class AccountController {
    // Get all accounts (admin only)
    async getAllAccounts(req, res) {
        try {
            const accounts = await Account_model_1.default.findAll({
                include: [
                    {
                        model: User_model_1.default,
                        as: 'user',
                        attributes: ['id', 'email'],
                        include: [
                            {
                                model: Profile_model_1.default,
                                as: 'profile',
                                attributes: ['id', 'fullName']
                            }
                        ]
                    }
                ]
            });
            res.json(accounts);
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Get account by ID
    async getAccountById(req, res) {
        try {
            const id = (req?.user).id;
            const account = await Account_model_1.default.findOne({
                where: { userId: id },
                include: [
                    {
                        model: User_model_1.default,
                        as: 'user',
                        attributes: ['id', 'email'],
                        include: [
                            {
                                model: Profile_model_1.default,
                                as: 'profile',
                                required: false,
                                attributes: ['id', 'fullName']
                            },
                            {
                                model: Transaction_model_1.default,
                                required: false,
                                as: 'transactions'
                            }
                        ]
                    }
                ]
            });
            if (!account) {
                return res.status(404).json({ status: 'fail', data: null, message: 'Account not found' });
            }
            res.json({ status: 'success', data: { account }, message: 'Account found' });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ status: 'fail', data: null, message: 'Error! Internal server error: ' + error.message });
        }
    }
    // Get account by ID
    async getAccountByAccountNumber(req, res) {
        try {
            const accountNumber = req.params.accountNumber;
            const account = await Account_model_1.default.findOne({
                where: { accountNumber: accountNumber },
                include: [
                    {
                        model: User_model_1.default,
                        as: 'user',
                        attributes: ['id', 'email'],
                        include: [
                            {
                                model: Profile_model_1.default,
                                as: 'profile',
                                required: false,
                                attributes: ['id', 'fullName']
                            },
                            {
                                model: Transaction_model_1.default,
                                required: false,
                                as: 'transactions'
                            }
                        ]
                    }
                ]
            });
            if (!account) {
                return res.status(404).json({ status: 'fail', data: null, message: 'Account not found' });
            }
            res.json({ status: 'success', data: { account }, message: 'Account found' });
        }
        catch (error) {
            console.log(error);
            res.status(500).json({ status: 'fail', data: null, message: 'Error! Internal server error: ' + error.message });
        }
    }
    // Create account
    async createAccount(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            // Check if user exists
            const user = await User_model_1.default.findByPk(req.body.userId);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const account = await Account_model_1.default.create(req.body);
            res.status(201).json(account);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create account' });
        }
    }
    // Update account
    async updateAccount(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const account = await Account_model_1.default.findByPk(req.params.id);
            if (!account) {
                return res.status(404).json({ error: 'Account not found' });
            }
            await account.update(req.body);
            res.json(account);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update account' });
        }
    }
    // Delete account
    async deleteAccount(req, res) {
        try {
            const account = await Account_model_1.default.findByPk(req.params.id);
            if (!account) {
                return res.status(404).json({ error: 'Account not found' });
            }
            await account.destroy();
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to delete account' });
        }
    }
    // Get user's accounts
    async getUserAccounts(req, res) {
        try {
            const userId = req.user?.id || req.params.userId;
            const accounts = await Account_model_1.default.findAll({
                where: { userId },
                include: [
                    {
                        model: User_model_1.default,
                        as: 'user',
                        attributes: ['id', 'email'],
                        include: [
                            {
                                model: Profile_model_1.default,
                                as: 'profile',
                                attributes: ['id', 'fullName']
                            }
                        ]
                    }
                ]
            });
            res.json(accounts);
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Update account balance
    async updateBalance(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { id } = req.params;
            const { amount, operation } = req.body; // operation: 'add' or 'subtract'
            const account = await Account_model_1.default.findByPk(id);
            if (!account) {
                return res.status(404).json({ error: 'Account not found' });
            }
            let newBalance;
            if (operation === 'add') {
                newBalance = parseFloat(account.balance.toString()) + parseFloat(amount);
            }
            else if (operation === 'subtract') {
                newBalance = parseFloat(account.balance.toString()) - parseFloat(amount);
                if (newBalance < 0) {
                    return res.status(400).json({ error: 'Insufficient funds' });
                }
            }
            else {
                return res.status(400).json({ error: 'Invalid operation' });
            }
            await account.update({ balance: newBalance });
            res.json(account);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update balance' });
        }
    }
}
exports.default = new AccountController();
