"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ComplianceSetting_model_1 = __importDefault(require("../models/ComplianceSetting.model"));
const express_validator_1 = require("express-validator");
const AuditLog_model_1 = __importDefault(require("../models/AuditLog.model"));
class ComplianceSettingController {
    // Get all compliance settings (admin only)
    async getAllComplianceSettings(req, res) {
        try {
            const { page = 1, limit = 50, settingType, active } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};
            if (settingType)
                where.settingType = settingType;
            if (active !== undefined)
                where.active = active === 'true';
            const complianceSettings = await ComplianceSetting_model_1.default.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                order: [
                    ['settingType', 'ASC'],
                    ['settingKey', 'ASC']
                ]
            });
            res.json({
                total: complianceSettings.count,
                page: parseInt(page),
                totalPages: Math.ceil(complianceSettings.count / parseInt(limit)),
                settings: complianceSettings.rows
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Get compliance setting by ID
    async getComplianceSettingById(req, res) {
        try {
            const complianceSetting = await ComplianceSetting_model_1.default.findByPk(req.params.id);
            if (!complianceSetting) {
                return res.status(404).json({ error: 'Compliance setting not found' });
            }
            res.json(complianceSetting);
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Get compliance setting by key
    async getComplianceSettingByKey(req, res) {
        try {
            const { key } = req.params;
            const complianceSetting = await ComplianceSetting_model_1.default.findOne({
                where: { settingKey: key }
            });
            if (!complianceSetting) {
                return res.status(404).json({ error: 'Compliance setting not found' });
            }
            res.json(complianceSetting);
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Create compliance setting (super admin only)
    async createComplianceSetting(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            // Check if key already exists
            const existingSetting = await ComplianceSetting_model_1.default.findOne({
                where: { settingKey: req.body.settingKey }
            });
            if (existingSetting) {
                return res.status(400).json({ error: 'Setting key already exists' });
            }
            const complianceSetting = await ComplianceSetting_model_1.default.create(req.body);
            // Log audit action
            const userId = req.user?.id;
            if (userId) {
                await AuditLog_model_1.default.create({
                    userId,
                    action: 'CREATE_COMPLIANCE_SETTING',
                    resourceType: 'compliance_setting',
                    resourceId: complianceSetting.id,
                    details: {
                        settingKey: complianceSetting.settingKey,
                        settingType: complianceSetting.settingType
                    }
                });
            }
            res.status(201).json(complianceSetting);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create compliance setting' });
        }
    }
    // Update compliance setting (super admin only)
    async updateComplianceSetting(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const complianceSetting = await ComplianceSetting_model_1.default.findByPk(req.params.id);
            if (!complianceSetting) {
                return res.status(404).json({ error: 'Compliance setting not found' });
            }
            const previousValue = complianceSetting.settingValue;
            await complianceSetting.update(req.body);
            // Log audit action
            const userId = req.user?.id;
            if (userId) {
                await AuditLog_model_1.default.create({
                    userId,
                    action: 'UPDATE_COMPLIANCE_SETTING',
                    resourceType: 'compliance_setting',
                    resourceId: complianceSetting.id,
                    details: {
                        settingKey: complianceSetting.settingKey,
                        previousValue,
                        newValue: complianceSetting.settingValue
                    }
                });
            }
            res.json(complianceSetting);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update compliance setting' });
        }
    }
    // Delete compliance setting (super admin only)
    async deleteComplianceSetting(req, res) {
        try {
            const complianceSetting = await ComplianceSetting_model_1.default.findByPk(req.params.id);
            if (!complianceSetting) {
                return res.status(404).json({ error: 'Compliance setting not found' });
            }
            // Log audit action
            const userId = req.user?.id;
            if (userId) {
                await AuditLog_model_1.default.create({
                    userId,
                    action: 'DELETE_COMPLIANCE_SETTING',
                    resourceType: 'compliance_setting',
                    resourceId: complianceSetting.id,
                    details: {
                        settingKey: complianceSetting.settingKey,
                        settingType: complianceSetting.settingType
                    }
                });
            }
            await complianceSetting.destroy();
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to delete compliance setting' });
        }
    }
    // Get settings by type
    async getSettingsByType(req, res) {
        try {
            const { type } = req.params;
            const { active } = req.query;
            const where = { settingType: type };
            if (active !== undefined)
                where.active = active === 'true';
            const complianceSettings = await ComplianceSetting_model_1.default.findAll({
                where,
                order: [['settingKey', 'ASC']]
            });
            res.json(complianceSettings);
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Apply transaction limit check
    async checkTransactionLimit(req, res) {
        try {
            const { userId, amount, transactionType } = req.body;
            if (!userId || !amount || !transactionType) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }
            // Get transaction limit settings
            const limitSettings = await ComplianceSetting_model_1.default.findAll({
                where: {
                    settingType: 'transaction_limit',
                    active: true
                }
            });
            const limits = {};
            limitSettings.forEach(setting => {
                limits[setting.settingKey] = setting.settingValue;
            });
            // Check daily limit
            const dailyLimit = limits.daily_limit || 10000;
            // In production, you would query the database for today's transactions
            const todayTransactions = 0; // Placeholder
            const remainingDaily = dailyLimit - todayTransactions;
            const canProceed = parseFloat(amount) <= remainingDaily;
            res.json({
                canProceed,
                limits: {
                    daily: dailyLimit,
                    perTransaction: limits.per_transaction_limit || 5000,
                    monthly: limits.monthly_limit || 50000
                },
                currentUsage: {
                    daily: todayTransactions,
                    remainingDaily: remainingDaily
                },
                requestedAmount: amount
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Apply AML rules check
    async checkAMLCompliance(req, res) {
        try {
            const { userId, amount, fromAccountId, toAccountId } = req.body;
            if (!userId || !amount) {
                return res.status(400).json({ error: 'Missing required parameters' });
            }
            // Get AML rules
            const amlRules = await ComplianceSetting_model_1.default.findAll({
                where: {
                    settingType: 'aml_rule',
                    active: true
                }
            });
            const rules = {};
            amlRules.forEach(rule => {
                rules[rule.settingKey] = rule.settingValue;
            });
            const flags = [];
            const threshold = rules.suspicious_amount_threshold || 10000;
            // Check suspicious amount
            if (parseFloat(amount) >= threshold) {
                flags.push({
                    rule: 'suspicious_amount_threshold',
                    description: `Transaction amount exceeds suspicious threshold of ${threshold}`,
                    level: 'high'
                });
            }
            // Check frequency (would require actual transaction data)
            // Placeholder for actual implementation
            res.json({
                compliant: flags.length === 0,
                flags,
                rulesApplied: Object.keys(rules),
                recommendation: flags.length > 0 ? 'REVIEW_REQUIRED' : 'PROCEED'
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Bulk update settings
    async bulkUpdateSettings(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { settings } = req.body; // Array of { id, updates }
            const updatedSettings = [];
            const userId = req.user?.id;
            for (const setting of settings) {
                const complianceSetting = await ComplianceSetting_model_1.default.findByPk(setting.id);
                if (complianceSetting) {
                    const previousValue = complianceSetting.settingValue;
                    await complianceSetting.update(setting.updates);
                    // Log audit action for each update
                    if (userId) {
                        await AuditLog_model_1.default.create({
                            userId,
                            action: 'BULK_UPDATE_COMPLIANCE_SETTING',
                            resourceType: 'compliance_setting',
                            resourceId: complianceSetting.id,
                            details: {
                                settingKey: complianceSetting.settingKey,
                                previousValue,
                                newValue: complianceSetting.settingValue,
                                updates: setting.updates
                            }
                        });
                    }
                    updatedSettings.push(complianceSetting);
                }
            }
            res.json({
                message: `${updatedSettings.length} settings updated successfully`,
                updatedSettings
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update settings' });
        }
    }
}
exports.default = new ComplianceSettingController();
