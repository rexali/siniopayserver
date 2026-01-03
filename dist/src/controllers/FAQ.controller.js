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
                total: faqs.count,
                page: parseInt(page),
                totalPages: Math.ceil(faqs.count / parseInt(limit)),
                faqs: faqs.rows
            });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Get FAQ by ID
    async getFAQById(req, res) {
        try {
            const faq = await FAQ_model_1.default.findByPk(req.params.id);
            if (!faq) {
                return res.status(404).json({ error: 'FAQ not found' });
            }
            res.json(faq);
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Create FAQ (admin only)
    async createFAQ(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const faq = await FAQ_model_1.default.create(req.body);
            res.status(201).json(faq);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to create FAQ' });
        }
    }
    // Update FAQ (admin only)
    async updateFAQ(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const faq = await FAQ_model_1.default.findByPk(req.params.id);
            if (!faq) {
                return res.status(404).json({ error: 'FAQ not found' });
            }
            await faq.update(req.body);
            res.json(faq);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update FAQ' });
        }
    }
    // Delete FAQ (admin only)
    async deleteFAQ(req, res) {
        try {
            const faq = await FAQ_model_1.default.findByPk(req.params.id);
            if (!faq) {
                return res.status(404).json({ error: 'FAQ not found' });
            }
            await faq.destroy();
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to delete FAQ' });
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
            res.json(categories.map((cat) => cat.category));
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Search FAQs
    async searchFAQs(req, res) {
        try {
            const { q, category } = req.query;
            if (!q) {
                return res.status(400).json({ error: 'Search query is required' });
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
            res.json(faqs);
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
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
            res.json({ message: 'FAQs reordered successfully' });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to reorder FAQs' });
        }
    }
}
exports.default = new FAQController();
