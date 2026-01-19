import { Request, Response } from 'express';
import Account from '../models/Account.model';
import Profile from '../models/Profile.model';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import User from '../models/User.model';
import Transaction from '../models/Transaction.model';

class AccountController {
  // Get all accounts (admin only)
  async getAllAccounts(req: Request, res: Response) {
    try {
      const accounts = await Account.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email'],
            include: [
              {
                model: Profile,
                as: 'profile',
                attributes: ['id', 'fullName']
              }
            ]
          }
        ]
      });
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get account by ID
  async getAccountById(req: Request, res: Response) {
    try {
      const id = (req?.user as any).id
      const account = await Account.findOne({
        where: { userId: id },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email'],
            include: [
              {
                model: Profile,
                as: 'profile',
                required: false,
                attributes: ['id', 'fullName']
              },
              {
                model: Transaction,
                required: false,
                as: 'transactions'
              }
            ]
          }
        ]
      });
      if (!account) {
        return res.status(404).json({ status: 'fail', data: null, message: 'Account not found'});
      }
      res.status(200).json({ status: 'success', data: { account }, message: 'Account found' });
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ status: 'fail', data: null, message: 'Error! Internal server error: ' + error.message });
    }
  }

  
  // Get account by ID
  async getAccountByAccountNumber(req: Request, res: Response) {
    try {

      const accountNumber = req.params.accountNumber
      
      const account = await Account.findOne({
        where: { accountNumber: accountNumber },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email'],
            include: [
              {
                model: Profile,
                as: 'profile',
                required: false,
                attributes: ['id', 'fullName']
              },
              {
                model: Transaction,
                required: false,
                as: 'transactions'
              }
            ]
          }
        ]
      });
      if (!account) {
        return res.status(404).json({ status: 'fail', data: null, message: 'Account not found'});
      }
      res.status(200).json({ status: 'success', data: { account }, message: 'Account found' });
    } catch (error: any) {
      console.log(error);
      res.status(500).json({ status: 'fail', data: null, message: 'Error! Internal server error: ' + error.message });
    }
  }

  // Create account
  async createAccount(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Check if user exists
      const user = await User.findByPk(req.body.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const account = await Account.create(req.body);
      res.status(201).json(account);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create account' });
    }
  }

  // Update account
  async updateAccount(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const account = await Account.findByPk(req.params.id);
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      await account.update(req.body);
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update account' });
    }
  }

  // Delete account
  async deleteAccount(req: Request, res: Response) {
    try {
      const account = await Account.findByPk(req.params.id);
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      await account.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete account' });
    }
  }

  // Get user's accounts
  async getUserAccounts(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id || req.params.userId
      const accounts = await Account.findAll({
        where: { userId },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'email'],
            include: [
              {
                model: Profile,
                as: 'profile',
                attributes: ['id', 'fullName']
              }
            ]
          }
        ]
      });
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update account balance
  async updateBalance(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { id } = req.params;
      const { amount, operation } = req.body; // operation: 'add' or 'subtract'

      const account = await Account.findByPk(id);
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }

      let newBalance;
      if (operation === 'add') {
        newBalance = parseFloat(account.balance.toString()) + parseFloat(amount);
      } else if (operation === 'subtract') {
        newBalance = parseFloat(account.balance.toString()) - parseFloat(amount);
        if (newBalance < 0) {
          return res.status(400).json({ error: 'Insufficient funds' });
        }
      } else {
        return res.status(400).json({ error: 'Invalid operation' });
      }

      await account.update({ balance: newBalance });
      res.json(account);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update balance' });
    }
  }
}

export default new AccountController();