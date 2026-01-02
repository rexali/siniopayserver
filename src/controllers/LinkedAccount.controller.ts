import { Request, Response } from 'express';
import LinkedAccount from '../models/LinkedAccount.model';
import Account from '../models/Account.model';
import Profile from '../models/Profile.model';
import { validationResult } from 'express-validator';
import User from '../models/User.model';

class LinkedAccountController {
  // Get all linked accounts (admin only)
  async getAllLinkedAccounts(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50, status, accountType } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const where: any = {};
      if (status) where.status = status;
      if (accountType) where.externalAccountType = accountType;

      const linkedAccounts = await LinkedAccount.findAndCountAll({
        where,
        limit: parseInt(limit as string),
        offset,
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'email'],
            include:[
              {
                model:Profile,
                as:'profile',
                attributes:['id', 'fullName']
              }
            ] 
          },
          { model: Account, as: 'account', attributes: ['id', 'accountNumber', 'accountType'] }
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({
        total: linkedAccounts.count,
        page: parseInt(page as string),
        totalPages: Math.ceil(linkedAccounts.count / parseInt(limit as string)),
        linkedAccounts: linkedAccounts.rows
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get linked account by ID
  async getLinkedAccountById(req: Request, res: Response) {
    try {
      const linkedAccount = await LinkedAccount.findByPk(req.params.id, {
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'email'],
            include:[
              {
                model:Profile,
                as:'profile',
                attributes:['id', 'fullName']
              }
            ] 
          },
          { model: Account, as: 'account', attributes: ['id', 'accountNumber', 'balance'] }
        ]
      });
      if (!linkedAccount) {
        return res.status(404).json({ error: 'Linked account not found' });
      }
      res.json(linkedAccount);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create linked account
  async createLinkedAccount(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user exists
      const user = await Profile.findByPk(req.body.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Check if account exists
      const account = await Account.findByPk(req.body.accountId);
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      // Check if account belongs to user
      if (account.userId !== req.body.userId) {
        return res.status(403).json({ error: 'Account does not belong to user' });
      }

      // Check for duplicate linked account
      const existingLinkedAccount = await LinkedAccount.findOne({
        where: {
          userId: req.body.userId,
          accountId: req.body.accountId,
          externalAccountType: req.body.externalAccountType,
          status: 'active'
        }
      });

      if (existingLinkedAccount) {
        return res.status(400).json({ error: 'Account already linked' });
      }

      const linkedAccount = await LinkedAccount.create(req.body);
      res.status(201).json(linkedAccount);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create linked account' });
    }
  }

  // Update linked account
  async updateLinkedAccount(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const linkedAccount = await LinkedAccount.findByPk(req.params.id);
      if (!linkedAccount) {
        return res.status(404).json({ error: 'Linked account not found' });
      }

      await linkedAccount.update(req.body);
      res.json(linkedAccount);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update linked account' });
    }
  }

  // Delete linked account
  async deleteLinkedAccount(req: Request, res: Response) {
    try {
      const linkedAccount = await LinkedAccount.findByPk(req.params.id);
      if (!linkedAccount) {
        return res.status(404).json({ error: 'Linked account not found' });
      }

      await linkedAccount.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete linked account' });
    }
  }

  // Get user's linked accounts
  async getUserLinkedAccounts(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const linkedAccounts = await LinkedAccount.findAll({
        where: { userId, status: 'active' },
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'email'],
            include:[
              {
                model:Profile,
                as:'profile',
                attributes:['id', 'fullName']
              }
            ] 
          },
          { model: Account, as: 'account', attributes: ['id', 'accountNumber', 'balance'] }
        ],
        order: [['createdAt', 'DESC']]
      });
      res.json(linkedAccounts);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get account's linked accounts
  async getAccountLinkedAccounts(req: Request, res: Response) {
    try {
      const accountId = req.params.accountId;
      const linkedAccounts = await LinkedAccount.findAll({
        where: { accountId, status: 'active' },
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'email'],
            include:[
              {
                model:Profile,
                as:'profile',
                attributes:['id', 'fullName']
              }
            ] 
          },
          { model: Account, as: 'account', attributes: ['id', 'accountNumber', 'balance'] }
        ]
      });
      res.json(linkedAccounts);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new LinkedAccountController();