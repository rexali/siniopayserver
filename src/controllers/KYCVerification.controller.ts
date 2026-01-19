import { Request, Response } from 'express';
import KYCVerification from '../models/KYCVerification.model';
import Profile from '../models/Profile.model';
import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import AuditLog from '../models/AuditLog.model';
import User from '../models/User.model';

class KYCVerificationController {
  // Get all KYC verifications (admin only)
  async getAllKYCVerifications(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50, status, userId } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const where: any = {};
      if (status) where.status = status;
      if (userId) where.userId = userId;

      const kycVerifications = await KYCVerification.findAndCountAll({
        where,
        limit: parseInt(limit as string),
        offset,
        include: [
          { 
            model: User, 
            as: 'user', 
            attributes: ['id', 'email', 'status'],
            include:[
              {
                model:Profile,
                as:'profile',
                attributes:['id', 'fullName']
              }
            ] 
          },
          { 
            model: User, 
            as: 'verifier', 
            attributes: ['id', 'email'],
            include:[
              {
                model:Profile,
                as:'profile',
                attributes:['id', 'fullName']
              }
            ] 
          },
        ],
        order: [['createdAt', 'DESC']]
      });

      res.json({ status: 'success', data: {
        total: kycVerifications.count,
        page: parseInt(page as string),
        totalPages: Math.ceil(kycVerifications.count / parseInt(limit as string)),
        verifications: kycVerifications.rows
      }, message: 'KYC Verifications found'});
    } catch (error:any) {
      console.error(error);
      res.status(500).json({ status: 'fail', data: null, message: 'Internal server error: ' + error.message });
    }
  }

  // Get KYC verification by ID
  async getKYCVerificationById(req: Request, res: Response) {
    try {
      const kycVerification = await KYCVerification.findByPk(req.params.id, {
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
          { 
            model: User, 
            as: 'verifier', 
            attributes: ['id', 'email'],
            include:[
              {
                model:Profile,
                as:'profile',
                attributes:['id', 'fullName']
              }
            ] 
          },
        ]
      });
      if (!kycVerification) {
        return res.status(404).json({ error: 'KYC verification not found' });
      }
      res.json(kycVerification);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Create KYC verification
  async createKYCVerification(req: Request, res: Response) {
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

      // Check for existing pending verification of same type
      const existingVerification = await KYCVerification.findOne({
        where: {
          userId: req.body.userId,
          verificationType: req.body.verificationType,
          status: { [Op.in]: ['pending', 'under_review'] }
        }
      });

      if (existingVerification) {
        return res.status(400).json({ error: 'Verification already in progress for this type' });
      }

      const kycVerification = await KYCVerification.create(req.body);
      res.status(201).json(kycVerification);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create KYC verification' });
    }
  }

  // Update KYC verification (admin only - for approval/rejection)
  async updateKYCVerification(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const kycVerification = await KYCVerification.findByPk(req.params.id);
      if (!kycVerification) {
        return res.status(404).json({ error: 'KYC verification not found' });
      }

      const userId = (req as any).user?.id;
      
      // Log audit action
      await AuditLog.create({
        userId,
        action: 'UPDATE_KYC_VERIFICATION',
        resourceType: 'kyc_verification',
        resourceId: kycVerification.id,
        details: {
          previousStatus: kycVerification.status,
          newStatus: req.body.status,
          reason: req.body.rejectionReason || null
        }
      });

      // Update verification
      const updateData: any = { ...req.body };
      if (req.body.status === 'approved' || req.body.status === 'rejected') {
        updateData.verifiedBy = userId;
        updateData.verifiedAt = new Date();
      }

      await kycVerification.update(updateData);
      res.json(kycVerification);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update KYC verification' });
    }
  }

  // Get user's KYC verifications
  async getUserKYCVerifications(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      const kycVerifications = await KYCVerification.findAll({
        where: { userId },
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
          { 
            model: User, 
            as: 'verifier', 
            attributes: ['id', 'email'],
            include:[
              {
                model:Profile,
                as:'profile',
                attributes:['id', 'fullName']
              }
            ] 
          },
        ],
        order: [['createdAt', 'DESC']]
      });
      res.json(kycVerifications);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Check KYC status for a user
  async checkKYCStatus(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      
      const verifications = await KYCVerification.findAll({
        where: { userId },
        attributes: ['verificationType', 'status', 'verifiedAt']
      });

      // Determine overall KYC status
      let overallStatus = 'not_started';
      const identityVerified = verifications.some(v => 
        v.verificationType === 'identity' && v.status === 'approved'
      );
      const addressVerified = verifications.some(v => 
        v.verificationType === 'address' && v.status === 'approved'
      );

      if (identityVerified && addressVerified) {
        overallStatus = 'fully_verified';
      } else if (identityVerified || addressVerified) {
        overallStatus = 'partially_verified';
      } else if (verifications.some(v => v.status === 'pending' || v.status === 'under_review')) {
        overallStatus = 'in_progress';
      }

      res.json({
        userId,
        overallStatus,
        verifications
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

export default new KYCVerificationController();