import { Request, Response } from 'express';
import Profile from '../models/Profile.model';
import { validationResult } from 'express-validator';
import Account from '../models/Account.model';
import { uploadFiles } from '../utils/uploadFile';
import multer from 'multer';
import { filterFilesByName } from '../utils/filterFilesByName';
import User from '../models/User.model';

class ProfileController {
  // Get all profiles (admin only)
  async getAllProfiles(req: Request, res: Response) {
    try {
      const profiles = await Profile.findAll({
        include: {
          model: User,
          as: 'user',
          required: false
        }
      });
      res.status(200).json({ status: 'success', data: { profiles }, message: 'Profile found' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Get profile by ID
  async getProfileById(req: Request, res: Response) {
    try {
      const profile = await Profile.findByPk(req.params.id);
      if (!profile) {
        return res.status(404).json({ status: 'fail', data: null, message: 'Profile not found' });
      }
      res.status(200).json({ status: 'success', data: { profile }, message: 'Profile found' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
    }
  }

  // Create profile
  async createProfile(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    uploadFiles()(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        throw new Error(err.message)
      } else if (err) {
        // An unknown error occurred when uploading.
        throw new Error(err)
      };
      // TO DO
      // Here Everything went fine, send the file name and other fields to database 
      try {
        let avatarUrl, ninUrl, addressUrl;

        if (req.files?.length) {  // loop thru the file and add
          // const data = req.body as HotelType;
          if (filterFilesByName(req.files, 'image').length) {
            avatarUrl = filterFilesByName(req.files, 'image')[0];
          } else {
            avatarUrl = '';
          }

          if (filterFilesByName(req.files, 'addressDoc').length) {
            addressUrl = filterFilesByName(req.files, 'addressDoc')[0];
          } else {
            addressUrl = '';
          }


          if (filterFilesByName(req.files, 'ninDoc').length) {
            ninUrl = filterFilesByName(req.files, 'ninDoc')[0];
          } else {
            ninUrl = '';
          }

        } else {
          console.log('No file(s)');
        }

        const data = {
          ...req.body,
          avatarUrl,
          ninUrl,
          addressUrl
        }

        const profile = await Profile.create(data);
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

    });
  }

  // Update profile
  async updateProfile(req: Request, res: Response) {
    console.log('current working directory', process.cwd());
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array());
      return res.status(400).json({ status: 'fail', data: null, message: 'Failed validation' });
    }

    uploadFiles()(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading.
        throw new Error(err.message)
      } else if (err) {
        // An unknown error occurred when uploading.
        throw new Error(err)
      };
      // TO DO
      // Here Everything went fine, send the file name and other fields to database 
      try {

        let avatarUrl, ninUrl, addressUrl;

        if (req.files?.length) {  // loop thru the file and add
          // const data = req.body as HotelType;
          if (filterFilesByName(req.files, 'image').length) {
            avatarUrl = filterFilesByName(req.files, 'image')[0];
          } else {
            let profile = await Profile.findByPk((req as any).user.id);
            avatarUrl = profile?.avatarUrl;
          }

          if (filterFilesByName(req.files, 'address').length) {
            addressUrl = filterFilesByName(req.files, 'address')[0];
          } else {
            let profile = await Profile.findByPk((req as any).user.id) as any;
            addressUrl = profile?.addressUrl;
          }

          if (filterFilesByName(req.files, 'nin').length) {
            ninUrl = filterFilesByName(req.files, 'nin')[0];
          } else {
            let profile = await Profile.findByPk((req as any).user.id) as any;
            ninUrl = profile?.ninUrl;
          }
        } else {
          console.log('No file(s)');
        }

        const data = {
          ...req.body,
          avatarUrl,
          ninUrl,
          addressUrl
        }

        const profile = await Profile.findOne({ where: { userId: req.params.id } });

        if (!profile) {
          return res.status(404).json({ status: 'fail', data: null, message: 'Profile not found' });
        }

        await profile.update(data);
        res.status(200).json({ status: 'success', data: { profile }, message: 'Profile updated' });
      } catch (error) {
        console.error(error);
        res.status(500).json({ status: 'fail', data: null, message: 'Failed to update profile' });
      }

    });
  }

  // Delete profile
  async deleteProfile(req: Request, res: Response) {
    try {
      const profile = await Profile.findByPk(req.params.id);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }

      await profile.destroy();
      res.status(204).json({status: 'success', data: {}, message: 'Profile deleted' });
    } catch (error) {
      res.status(500).json({status: 'fail', data: null, message: 'Failed to delete profile' });
    }
  }

  // Get user's own profile
  async getMyProfile(req: Request, res: Response) {
    try {
      // Assuming user ID is available in req.user after authentication
      const userId = (req as any).user?.id;

      if (!userId) {
        return res.status(401).json({ status: "fail", data: null, message: 'Unauthorized' });
      }

      const profile = await Profile.findOne({
        where: {
          userId
        }
      });

      if (!profile) {
        return res.status(404).json({ status: "fail", data: null, message: 'Profile not found' });
      }

      res.status(200).json({ status: "success", data: { profile }, message: 'Profile found' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ status: "fail", data: null, message: 'Internal server error' });
    }
  }
}

export default new ProfileController();