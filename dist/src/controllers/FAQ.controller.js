"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const FAQ_model_1 = __importDefault(require("../models/FAQ.model"));
const express_validator_1 = require("express-validator");
const sequelize_1 = require("sequelize");
class FAQController {
    // Get all FAQs (public)
    async getAllFAQs(req, res) {
        try {
            const { page = 1, limit = 50, category, active } = req.query;
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const where = {};
            if (category)
                where.category = category;
            if (active !== undefined)
                where.active = active === 'true';
            const faqs = await FAQ_model_1.default.findAndCountAll({
                where,
                limit: parseInt(limit),
                offset,
                order: [
                    ['category', 'ASC'],
                    ['orderIndex', 'ASC'],
                    ['createdAt', 'DESC']
                ]
            });
            res.json({
                status: 'success',
                data: {
                    total: faqs.count,
                    page: parseInt(page),
                    totalPages: Math.ceil(faqs.count / parseInt(limit)),
                    faqs: faqs.rows
                },
                message: 'FAQs found'
            });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Get FAQ by ID
    async getFAQById(req, res) {
        try {
            const faq = await FAQ_model_1.default.findByPk(req.params.id);
            if (!faq) {
                return res.status(404).json({ status: 'fail', data: null, message: 'FAQ not found' });
            }
            res.json({ status: 'success', data: { faq }, message: 'FAQ found' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Create FAQ (admin only)
    async createFAQ(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.error(errors.array());
            return res.status(400).json({ status: 'fail', data: null, message: 'Vaidation failed' });
        }
        try {
            const faq = await FAQ_model_1.default.create(req.body);
            res.status(201).json({ status: 'success', data: { faq }, message: 'FAQ created' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Failed to create FAQ' });
        }
    }
    // Update FAQ (admin only)
    async updateFAQ(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.error(errors.array());
            return res.status(400).json({ status: 'fail', data: null, message: 'Validation failed' });
        }
        try {
            const faq = await FAQ_model_1.default.findByPk(req.params.id);
            if (!faq) {
                return res.status(404).json({ status: 'fail', data: null, message: 'FAQ not found' });
            }
            const updatedFAQ = await faq.update(req.body);
            res.json({ status: 'success', data: { faq: updatedFAQ }, message: 'FAQ updated' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Delete FAQ (admin only)
    async deleteFAQ(req, res) {
        try {
            const faq = await FAQ_model_1.default.findByPk(req.params.id);
            if (!faq) {
                return res.status(404).json({ status: 'fail', data: null, message: 'FAQ not found' });
            }
            await faq.destroy();
            res.status(204).json({ status: 'success', data: {}, message: 'FAQ deleted' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Get FAQ categories
    async getFAQCategories(req, res) {
        try {
            const categories = await FAQ_model_1.default.findAll({
                attributes: ['category'],
                group: ['category'],
                where: { active: true }
            });
            res.json({ status: 'success', data: { faqCategories: categories.map((cat) => cat.category) }, message: 'Internal server error' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Search FAQs
    async searchFAQs(req, res) {
        try {
            const { q, category } = req.query;
            if (!q) {
                return res.status(400).json({ status: 'fail', data: null, message: 'Search query is required' });
            }
            const where = {
                active: true,
                [sequelize_1.Op.or]: [
                    { question: { [sequelize_1.Op.iLike]: `%${q}%` } },
                    { answer: { [sequelize_1.Op.iLike]: `%${q}%` } }
                ]
            };
            if (category) {
                where.category = category;
            }
            const faqs = await FAQ_model_1.default.findAll({
                where,
                order: [
                    ['category', 'ASC'],
                    ['orderIndex', 'ASC']
                ],
                limit: 20
            });
            res.json({ status: 'success', data: { faqs }, message: 'FAQs found' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Reorder FAQs
    async reorderFAQs(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const { faqs } = req.body; // Array of { id, orderIndex }
            const updates = faqs.map((faq) => ({
                id: faq.id,
                orderIndex: faq.orderIndex
            }));
            for (const update of updates) {
                await FAQ_model_1.default.update({ orderIndex: update.orderIndex }, { where: { id: update.id } });
            }
            res.json({ status: 'success', data: {}, message: 'FAQs reordered successfully' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Failed to reorder FAQs' });
        }
    }
}
exports.default = new FAQController();
