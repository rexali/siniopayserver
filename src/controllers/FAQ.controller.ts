import { Request, Response } from 'express';
import FAQ from '../models/FAQ.model';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';

class FAQController {
  // Get all FAQs (public)
  async getAllFAQs(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50, category, active } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = {};
      if (category) where.category = category;
      if (active !== undefined) where.active = active === 'true';

      const faqs = await FAQ.findAndCountAll({
        where,
        limit: parseInt(limit as string),
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
          page: parseInt(page as string),
          totalPages: Math.ceil(faqs.count / parseInt(limit as string)),
          faqs: faqs.rows
        },
        message: 'FAQs found'
      });
    } catch (error) {
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Get FAQ by ID
  async getFAQById(req: Request, res: Response) {
    try {
      const faq = await FAQ.findByPk(req.params.id);
      if (!faq) {
        return res.status(404).json({ status: 'fail', data: null, message: 'FAQ not found' });
      }
      res.json({ status: 'success', data: { faq }, message: 'FAQ found' });
    } catch (error) {
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Create FAQ (admin only)
  async createFAQ(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array());
      return res.status(400).json({ status: 'fail', data: null, message: 'Vaidation failed' });
    }

    try {
      const faq = await FAQ.create(req.body);
      res.status(201).json({ status: 'success', data: { faq }, message: 'FAQ created' });
    } catch (error) {
      res.status(500).json({ status: 'fail', data: null, message: 'Failed to create FAQ' });
    }
  }

  // Update FAQ (admin only)
  async updateFAQ(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array());
      return res.status(400).json({ status: 'fail', data: null, message: 'Validation failed' });
    }

    try {
      const faq = await FAQ.findByPk(req.params.id);
      if (!faq) {
        return res.status(404).json({ status: 'fail', data: null, message: 'FAQ not found' });
      }

      const updatedFAQ = await faq.update(req.body);
      res.json({ status: 'success', data: { faq: updatedFAQ }, message: 'FAQ updated' });
    } catch (error) {
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Delete FAQ (admin only)
  async deleteFAQ(req: Request, res: Response) {
    try {
      const faq = await FAQ.findByPk(req.params.id);
      if (!faq) {
        return res.status(404).json({ status: 'fail', data: null, message: 'FAQ not found' });
      }

      await faq.destroy();
      res.status(204).json({ status: 'success', data: {}, message: 'FAQ deleted' });
    } catch (error) {
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Get FAQ categories
  async getFAQCategories(req: Request, res: Response) {
    try {
      const categories = await FAQ.findAll({
        attributes: ['category'],
        group: ['category'],
        where: { active: true }
      });

      res.json({ status: 'success', data: { faqCategories: categories.map((cat: any) => cat.category) }, message: 'Internal server error' });
    } catch (error) {
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Search FAQs
  async searchFAQs(req: Request, res: Response) {
    try {
      const { q, category } = req.query;

      if (!q) {
        return res.status(400).json({status: 'fail', data: null, message: 'Search query is required' });
      }

      const where: any = {
        active: true,
        [Op.or]: [
          { question: { [Op.iLike]: `%${q}%` } },
          { answer: { [Op.iLike]: `%${q}%` } }
        ]
      };

      if (category) {
        where.category = category;
      }

      const faqs = await FAQ.findAll({
        where,
        order: [
          ['category', 'ASC'],
          ['orderIndex', 'ASC']
        ],
        limit: 20
      });

      res.json({status: 'success', data: {faqs}, message: 'FAQs found'});
    } catch (error) {
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Reorder FAQs
  async reorderFAQs(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { faqs } = req.body; // Array of { id, orderIndex }

      const updates = faqs.map((faq: any) => ({
        id: faq.id,
        orderIndex: faq.orderIndex
      }));

      for (const update of updates) {
        await FAQ.update(
          { orderIndex: update.orderIndex },
          { where: { id: update.id } }
        );
      }

      res.json({status: 'success', data: {}, message: 'FAQs reordered successfully' });
    } catch (error) {
      res.status(500).json({status: 'fail', data: null, message: 'Failed to reorder FAQs' });
    }
  }
}

export default new FAQController();