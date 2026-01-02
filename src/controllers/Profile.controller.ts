import { Request, Response } from 'express';
import Profile from '../models/Profile.model';
import { validationResult } from 'express-validator';
import Account from '../models/Account.model';
import { use } from 'passport';

class ProfileController {
  // Get all profiles (admin only)
  async getAllProfiles(req: Request, res: Response) {
    try {
      const profiles = await Profile.findAll();
      res.json(profiles);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get profile by ID
  async getProfileById(req: Request, res: Response) {
    try {
      const profile = await Profile.findByPk(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
      res.json(profile);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create profile
  async createProfile(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const profile = await Profile.create(req.body);
      if (profile !== null) {

        await Account.create({
          userId: profile.id,
          accountNumber: String(Math.floor(Math.random() * 10000000000))
        })

        res.status(201).json({
          status: 'success',
          data: { profile },
          message: 'Account created'
        });

      } else {
        res.status(400).json({
          status: 'fail',
          data: null,
          message: 'Account not created'
        });
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: 'fail',
        data: null,
        message: 'Error! Failed to create an account'
      });
    }
  }

  // Update profile
  async updateProfile(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array());
      return res.status(400).json({ status: 'fail', data: null, message: 'Failed validation' });
    }

    try {
      const profile = await Profile.findOne({ where: { userId: req.params.id } });
      if (!profile) {
        return res.status(404).json({ status: 'fail', data: null, message: 'Profile not found' });
      }

      await profile.update(req.body);
      res.json({ status: 'success', data: { profile }, message: 'Profile updated' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'fail', data: null, message: 'Failed to update profile' });
    }
  }

  // Delete profile
  async deleteProfile(req: Request, res: Response) {
    try {
      const profile = await Profile.findByPk(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      await profile.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete profile' });
    }
  }

  // Get user's own profile
  async getMyProfile(req: Request, res: Response) {
    try {
      // Assuming user ID is available in req.user after authentication
      const userId = (req as any).user?.id || req.params?.userId;
      console.log((req as any).user?.id);

      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const profile = await Profile.findOne({
        where: {
          userId
        }
      });

      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      res.json({ status: "success", data: { profile }, message: 'Profile found' });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new ProfileController();