"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Transaction_model_1 = __importDefault(require("../models/Transaction.model"));
const Account_model_1 = __importDefault(require("../models/Account.model"));
const Profile_model_1 = __importDefault(require("../models/Profile.model"));
const express_validator_1 = require("express-validator");
const db_1 = require("../config/db");
const sequelize_1 = require("sequelize");
const User_model_1 = __importDefault(require("../models/User.model"));
class TransactionController {
    // Get all transactions (admin only)
    async getAllTransactions(req, res) {
        try {
            const { page = 1, limit = 50, status, type } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};
            if (status)
                where.status = status;
            if (type)
                where.type = type;
            const transactions = await Transaction_model_1.default.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                include: [
                    { model: Account_model_1.default, as: 'fromAccount', attributes: ['id', 'accountNumber', 'accountType'] },
                    { model: Account_model_1.default, as: 'toAccount', attributes: ['id', 'accountNumber', 'accountType'] },
                    {
                        model: User_model_1.default,
                        as: 'reviewer',
                        attributes: ['id', 'email'],
                        include: [{
                                model: Profile_model_1.default,
                                as: 'profile',
                                attributes: ['id', 'fullName']
                            }]
                    }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.json({
                total: transactions.count,
                page: parseInt(page),
                totalPages: Math.ceil(transactions.count / parseInt(limit)),
                transactions: transactions.rows
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Get transaction by ID
    async getTransactionById(req, res) {
        try {
            const transaction = await Transaction_model_1.default.findByPk(req.params.id, {
                include: [
                    { model: Account_model_1.default, as: 'fromAccount', attributes: ['id', 'accountNumber', 'accountType'] },
                    { model: Account_model_1.default, as: 'toAccount', attributes: ['id', 'accountNumber', 'accountType'] },
                    {
                        model: User_model_1.default,
                        as: 'reviewer',
                        attributes: ['id', 'email'],
                        include: [{
                                model: Profile_model_1.default,
                                as: 'profile',
                                attributes: ['id', 'fullName']
                            }]
                    }
                ]
            });
            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }
            res.json(transaction);
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Get transaction by ID
    async getTransactionsByUser(req, res) {
        try {
            const transactions = await Transaction_model_1.default.findAll({
                where: {
                    [sequelize_1.Op.or]: [{ fromAccountId: req.params.id }, { toAccountId: req.params.id }]
                }
            });
            if (!transactions) {
                return res.status(404).json({ status: 'fail', data: null, message: 'Transaction not found' });
            }
            res.json({ status: 'success', data: { transactions }, message: 'Transaction found' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error: ' + error.message });
        }
    }
    // Create transaction (with transaction for consistency)
    async createTransaction(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.log(errors.array());
            return res.status(400).json({ status: 'fail', data: null, message: 'Validation failed: ' + errors.array() });
        }
        const transaction = await db_1.sequelize.transaction();
        try {
            const { fromAccountId, toAccountId, amount } = req.body;
            // Check if accounts exist
            const fromAccount = await Account_model_1.default.findOne({
                where: {
                    userId: fromAccountId
                },
                transaction
            });
            const toAccount = await Account_model_1.default.findOne({
                where: {
                    userId: toAccountId
                },
                transaction
            });
            if (!fromAccount || !toAccount) {
                await transaction.rollback();
                return res.status(404).json({ status: 'fail', data: null, message: 'One or both accounts not found' });
            }
            // Check if from account has sufficient funds
            if (parseFloat(fromAccount.balance.toString()) < parseFloat(amount)) {
                await transaction.rollback();
                return res.status(400).json({ status: 'fail', data: null, message: 'Insufficient funds' });
            }
            // Check if accounts are active
            if (fromAccount.status !== 'active' || toAccount.status !== 'active') {
                await transaction.rollback();
                return res.status(400).json({ status: 'fail', data: null, message: 'One or both accounts are not active' });
            }
            // Update balances
            const newFromBalance = parseFloat(fromAccount.balance.toString()) - parseFloat(amount);
            const newToBalance = parseFloat(toAccount.balance.toString()) + parseFloat(amount);
            await fromAccount.update({ balance: newFromBalance }, { transaction });
            await toAccount.update({ balance: newToBalance }, { transaction });
            // Create transaction record
            const transactionRecord = await Transaction_model_1.default.create({
                ...req.body,
                status: 'completed'
            }, { transaction });
            await transaction.commit();
            res.status(201).json({ status: 'success', data: { transaction: transactionRecord }, message: 'Transaction completed successfully' });
        }
        catch (error) {
            await transaction.rollback();
            console.log(error);
            res.status(500).json({ status: 'fail', data: null, message: 'Transaction failed' });
        }
    }
    // Update transaction (admin only - for status updates, flagging, etc.)
    async updateTransaction(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const transaction = await Transaction_model_1.default.findByPk(req.params.id);
            if (!transaction) {
                return res.status(404).json({ error: 'Transaction not found' });
            }
            // If reversing transaction, handle balance adjustments
            if (req.body.status === 'reversed' && transaction.status === 'completed') {
                const transactionDb = await db_1.sequelize.transaction();
                try {
                    const fromAccount = await Account_model_1.default.findByPk(transaction.fromAccountId, { transaction: transactionDb });
                    const toAccount = await Account_model_1.default.findByPk(transaction.toAccountId, { transaction: transactionDb });
                    if (fromAccount && toAccount) {
                        const amount = parseFloat(transaction.amount.toString());
                        const newFromBalance = parseFloat(fromAccount.balance.toString()) + amount;
                        const newToBalance = parseFloat(toAccount.balance.toString()) - amount;
                        await fromAccount.update({ balance: newFromBalance }, { transaction: transactionDb });
                        await toAccount.update({ balance: newToBalance }, { transaction: transactionDb });
                    }
                    await transaction.update({
                        ...req.body,
                        reviewedBy: req.user?.id,
                        reviewedAt: new Date()
                    }, { transaction: transactionDb });
                    await transactionDb.commit();
                    res.json(transaction);
                }
                catch (error) {
                    await transactionDb.rollback();
                    throw error;
                }
            }
            else {
                await transaction.update(req.body);
                res.json(transaction);
            }
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update transaction' });
        }
    }
    // Get transactions for specific account
    async getAccountTransactions(req, res) {
        try {
            const { accountId } = req.params;
            const { page = 1, limit = 50 } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const transactions = await Transaction_model_1.default.findAndCountAll({
                where: {
                    [sequelize_1.Op.or]: [
                        { fromAccountId: accountId },
                        { toAccountId: accountId }
                    ]
                },
                limit: parseInt(limit),
                offset,
                include: [
                    { model: Account_model_1.default, as: 'fromAccount', attributes: ['id', 'accountNumber'] },
                    { model: Account_model_1.default, as: 'toAccount', attributes: ['id', 'accountNumber'] }
                ],
                order: [['createdAt', 'DESC']]
            });
            res.json({
                total: transactions.count,
                page: parseInt(page),
                totalPages: Math.ceil(transactions.count / parseInt(limit)),
                transactions: transactions.rows
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.default = new TransactionController();
