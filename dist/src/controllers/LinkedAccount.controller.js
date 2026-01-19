"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LinkedAccount_model_1 = __importDefault(require("../models/LinkedAccount.model"));
const Account_model_1 = __importDefault(require("../models/Account.model"));
const Profile_model_1 = __importDefault(require("../models/Profile.model"));
const express_validator_1 = require("express-validator");
const User_model_1 = __importDefault(require("../models/User.model"));
class LinkedAccountController {
    // Get all linked accounts (admin only)
    async getAllLinkedAccounts(req, res) {
        try {
            const { page = 1, limit = 50, status, accountType } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};
            if (status)
                where.status = status;
            if (accountType)
                where.externalAccountType = accountType;
            const linkedAccounts = await LinkedAccount_model_1.default.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
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
                    },
                    { model: Account_model_1.default, as: 'account', attributes: ['id', 'accountNumber', 'accountType'] }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.json({
                status: 'success',
                data: {
                    total: linkedAccounts.count,
                    page: parseInt(page),
                    totalPages: Math.ceil(linkedAccounts.count / parseInt(limit)),
                    linkedAccounts: linkedAccounts.rows
                },
                message: 'Linked accounts found'
            });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Get linked account by ID
    async getLinkedAccountById(req, res) {
        try {
            const linkedAccount = await LinkedAccount_model_1.default.findByPk(req.params.id, {
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
                    },
                    { model: Account_model_1.default, as: 'account', attributes: ['id', 'accountNumber', 'balance'] }
                ]
            });
            if (!linkedAccount) {
                return res.status(404).json({ status: 'fail', data: null, message: 'Linked account not found' });
            }
            res.json({ status: 'success', data: { linkedAccount }, message: 'Linked account found' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Create linked account
    async createLinkedAccount(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.error(errors.array());
            return res.status(400).json({ status: 'fail', data: null, message: 'Validation failed' });
        }
        try {
            // Check if user exists
            const user = await Profile_model_1.default.findByPk(req.body.userId);
            if (!user) {
                return res.status(404).json({ status: 'fail', data: null, message: 'User not found' });
            }
            // Check if account exists
            const account = await Account_model_1.default.findByPk(req.body.accountId);
            if (!account) {
                return res.status(404).json({ status: 'fail', data: null, message: 'Account not found' });
            }
            // Check if account belongs to user
            if (account.userId !== req.body.userId) {
                return res.status(403).json({ status: 'fail', data: null, message: 'Account does not belong to user' });
            }
            // Check for duplicate linked account
            const existingLinkedAccount = await LinkedAccount_model_1.default.findOne({
                where: {
                    userId: req.body.userId,
                    accountId: req.body.accountId,
                    externalAccountType: req.body.externalAccountType,
                    status: 'active'
                }
            });
            if (existingLinkedAccount) {
                return res.status(400).json({ status: 'fail', data: null, message: 'Account already linked' });
            }
            const linkedAccount = await LinkedAccount_model_1.default.create(req.body);
            res.status(201).json({ status: 'success', data: { linkedAccount }, message: 'Account found' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Failed to create linked account' });
        }
    }
    // Update linked account
    async updateLinkedAccount(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.error(errors.array());
            return res.status(400).json({ status: 'fail', data: null, message: 'Validation failed' });
        }
        try {
            const linkedAccount = await LinkedAccount_model_1.default.findByPk(req.params.id);
            if (!linkedAccount) {
                return res.status(404).json({ status: 'fail', data: null, message: 'Linked account not found' });
            }
            await linkedAccount.update(req.body);
            res.json({ status: 'success', data: { linkedAccount }, message: 'Linked account updated' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Failed to update linked account' });
        }
    }
    // Delete linked account
    async deleteLinkedAccount(req, res) {
        try {
            const linkedAccount = await LinkedAccount_model_1.default.findByPk(req.params.id);
            if (!linkedAccount) {
                return res.status(404).json({ status: 'fail', data: null, message: 'Linked account not found' });
            }
            await linkedAccount.destroy();
            res.status(204).json({ status: 'success', data: {}, message: 'Linked account account' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Failed to delete linked account' });
        }
    }
    // Get user's linked accounts
    async getUserLinkedAccounts(req, res) {
        try {
            const userId = req.params.userId;
            const linkedAccounts = await LinkedAccount_model_1.default.findAll({
                where: { userId, status: 'active' },
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
                    },
                    { model: Account_model_1.default, as: 'account', attributes: ['id', 'accountNumber', 'balance'] }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.json({ status: 'success', data: { linkedAccounts }, message: 'Linked accounts found' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Get account's linked accounts
    async getAccountLinkedAccounts(req, res) {
        try {
            const accountId = req.params.accountId;
            const linkedAccounts = await LinkedAccount_model_1.default.findAll({
                where: { accountId, status: 'active' },
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
                    },
                    { model: Account_model_1.default, as: 'account', attributes: ['id', 'accountNumber', 'balance'] }
                ]
            });
            res.json({ status: 'success', data: { linkedAccounts }, message: 'Linked accounts found' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
}
exports.default = new LinkedAccountController();
