
import { Request, Response } from 'express';
import User from '../models/User.model';
import Profile from '../models/Profile.model';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import AuditLog from '../models/AuditLog.model';
import crypto from 'crypto';
import { sendEmail } from '../utils/mailer';
import Account from '../models/Account.model';

class UserController {
  // Register new user
  async register(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error(errors.array());
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password, phone, dateOfBirth, firstName, lastName } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create user
      const user = await User.create({
        email,
        password,
        role: 'customer',
        status: 'pending'
      });

      // Create profile
      await Profile.create({
        userId: user.id,
        fullName: firstName + " " + lastName,
        phone,
        // dateOfBirth
      });

      // Generate email verification token
      // const verificationToken = jwt.sign(
      //   {
      //     userId: user.id,
      //     email: user.email
      //   },
      //   process.env.JWT_SECRET || 'your-secret-key',
      //   { expiresIn: '24h' }
      // );
      // Send verification email
      // await this.sendVerificationEmail(user.email, verificationToken, user.confirmationCode);

      // Generate JWT token
      // const token = this.generateToken(user);
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Create account
      await Account.create({
        userId: user.id,
        accountNumber: String(Math.floor(Math.random() * 10000000000))
      })

      // Log the registration
      await AuditLog.create({
        userId: user.id,
        action: 'USER_REGISTER',
        resourceType: 'user',
        resourceId: user.id,
        details: { email: user.email, role: user.role }
      });

      res.status(201).json({
        message: 'Registration successful. Please check your email for verification.',
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status
          },
          token
        }
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      res.status(500).json({ status: 'fail', data: { user: null, token: '' }, message: 'Error! Registration failed: ' + error.message });
    }
  }

  // Login user
  async login(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(400).json({ status: 'fail', data: { user: null, token: '' }, message: 'Error! Registration failed' });
    }

    try {
      const { email, password } = req.body;

      // Find user
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ status: 'fail', data: { user: null, token: '' }, message: 'Error! Invalid credentials' });
      }

      // Check password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ status: 'fail', data: { user: null, token: '' }, message: 'Error! Invalid credentials' });
      }

      // Check if account is active
      // if (user.status !== 'active') {
      if (user.status !== 'pending') {
        return res.status(403).json({ status: 'fail', data: { user: null, token: '' }, message: 'Error! Account is not active' });
      }
      // Check if email is verified
      // if (!user.emailVerifiedAt) {
      //   return res.status(403).json({ status: 'fail', data: { user: null, token: '' }, message: 'Error! Email not verified. Needs verification'});
      // }
      // Update last login
      user.lastLoginAt = new Date();
      await user.save();

      // Generate JWT token
      // const token = this.generateToken(user)  // this.generateToken(user);
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Get user profile
      const profile = await Profile.findOne({ where: { userId: user.id } });

      // Log the login
      await AuditLog.create({
        userId: user.id,
        action: 'USER_LOGIN',
        resourceType: 'user',
        resourceId: user.id,
        details: { email: user.email, role: user.role }
      });

      res.json({
        message: 'Login successful',
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            twoFactorAuthentication: user.twoFactorAuthentication,
            profile: profile ? {
              fullName: profile.fullName,
              phone: profile.phone
            } : null
          },
          token
        }
      });
    } catch (error: any) {
      console.error('Login error:', error);
      res.status(500).json({ status: 'fail', data: { user: null, token: null }, message: 'Error! Login failed: ' + error.message });
    }
  }

  // Verify User login token
  async verifyUserToken(req: Request, res: Response) {
    try {
      const { token: teken } = req.body;
      const token = teken || req.headers.authorization?.split(' ')[1];

      if (!token) {
        return res.status(400).json({ error: 'Verification token required' });
      }

      let userId: string;


      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

      userId = decoded.id;

      // Update user
      const user = await User.findByPk(userId);

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // if (user.emailVerifiedAt) {
      //   return res.status(400).json({ error: 'Email already verified' });
      // }

      // user.emailVerifiedAt = new Date();
      // user.status = 'active';
      // await user.save();

      // Get user profile
      const profile = await Profile.findOne({ where: { userId: user.id } });

      // Log the verification
      await AuditLog.create({
        userId: user.id,
        action: 'TOKEN_VERIFICATION',
        resourceType: 'user',
        resourceId: user.id,
        details: { email: user.email }
      });

      res.json({
        message: 'Token verified successfully',
        status: 'success',
        data: {
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            status: user.status,
            twoFactorAuthentication: user.twoFactorAuthentication,
            profile: profile ? {
              fullName: profile.fullName,
              phone: profile.phone
            } : null
          },
          token
        }
      });

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(400).json({ error: 'Verification token expired' });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(400).json({ error: 'Invalid verification token' });
      }
      res.status(500).json({ error: 'Token verification failed' });
    }
  }

  // Verify email
  async verifyEmail(req: Request, res: Response) {
    try {
      const { token, code } = req.body;

      if (!token && !code) {
        return res.status(400).json({ error: 'Verification token or code is required' });
      }

      let userId: string;

      if (token) {
        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
        userId = decoded.userId;
      } else {
        // Find user by confirmation code
        const user = await User.findOne({ where: { confirmationCode: code } });
        if (!user) {
          return res.status(400).json({ error: 'Invalid verification code' });
        }
        userId = user.id;
      }

      // Update user
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.emailVerifiedAt) {
        return res.status(400).json({ error: 'Email already verified' });
      }

      user.emailVerifiedAt = new Date();
      user.status = 'active';
      await user.save();

      // Log the verification
      await AuditLog.create({
        userId: user.id,
        action: 'EMAIL_VERIFICATION',
        resourceType: 'user',
        resourceId: user.id,
        details: { email: user.email }
      });

      res.json({
        message: 'Email verified successfully',
        user: {
          id: user.id,
          email: user.email,
          status: user.status
        }
      });

    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(400).json({ error: 'Verification token expired' });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(400).json({ error: 'Invalid verification token' });
      }
      res.status(500).json({ error: 'Email verification failed' });
    }
  }

  // Resend verification email
  async resendVerificationEmail(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (user.emailVerifiedAt) {
        return res.status(400).json({ error: 'Email already verified' });
      }

      // Generate new confirmation code if needed
      if (!user.confirmationCode) {
        user.confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();
        await user.save();
      }

      // Generate new verification token
      const verificationToken = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '24h' }
      );

      // Send verification email
      await this.sendVerificationEmail(user.email, verificationToken, user.confirmationCode);

      res.json({ message: 'Verification email sent successfully' });
    } catch (error) {
      console.error('Resend verification error:', error);
      res.status(500).json({ error: 'Failed to resend verification email' });
    }
  }

  // Get current user profile
  async getCurrentUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const user = await User.findByPk(userId, {
        include: [
          {
            model: Profile,
            as: 'profile',
            attributes: ['fullName', 'phone', 'dateOfBirth', 'address', 'avatarUrl']
          }
        ]
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json({
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
        twoFactorAuthentication: user.twoFactorAuthentication,
        emailVerifiedAt: user.emailVerifiedAt,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        profile: user.profile
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update current user
  async updateCurrentUser(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const userId = (req as any).user?.id;
      const { email, password, currentPassword, twoFactorAuthentication } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update email
      if (email && email !== user.email) {
        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
          return res.status(400).json({ error: 'Email already registered' });
        }

        user.email = email;
        user.emailVerifiedAt = new Date(); // change from null to date
        user.status = 'pending';

        // Generate new confirmation code
        user.confirmationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Send verification email for new email
        const verificationToken = jwt.sign(
          { userId: user.id, email: user.email },
          process.env.JWT_SECRET || 'your-secret-key',
          { expiresIn: '24h' }
        );

        await this.sendVerificationEmail(user.email, verificationToken, user.confirmationCode);
      }

      // Update password
      if (password) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Current password is required to change password' });
        }

        const isValidPassword = await user.comparePassword(currentPassword);
        if (!isValidPassword) {
          return res.status(401).json({ error: 'Current password is incorrect' });
        }

        await user.updatePassword(password);
      }

      // Update two-factor authentication
      if (twoFactorAuthentication !== undefined) {
        user.twoFactorAuthentication = twoFactorAuthentication;
      }

      await user.save();

      // Log the update
      await AuditLog.create({
        userId: user.id,
        action: 'USER_UPDATE',
        resourceType: 'user',
        resourceId: user.id,
        details: { fieldsUpdated: Object.keys(req.body) }
      });

      res.json({
        message: 'User updated successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          twoFactorAuthentication: user.twoFactorAuthentication,
          emailVerifiedAt: user.emailVerifiedAt
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  // Forgot password
  async forgotPassword(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email } = req.body;

      const user = await User.findOne({ where: { email } });
      if (!user) {
        // Don't reveal that user doesn't exist for security
        return res.json({ message: 'If an account exists with this email, you will receive a password reset link' });
      }

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

      // In a real application, you would save these to the database
      // For now, we'll generate a JWT token
      const resetPasswordToken = jwt.sign(
        { userId: user.id, email: user.email, type: 'password_reset' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      // Send password reset email
      await this.sendPasswordResetEmail(user.email, resetPasswordToken);

      res.json({ message: 'Password reset link sent to your email' });
    } catch (error) {
      console.error('Forgot password error:', error);
      res.status(500).json({ error: 'Failed to process password reset request' });
    }
  }

  // Reset password
  async resetPassword(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { token, password } = req.body;

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

      if (decoded.type !== 'password_reset') {
        return res.status(400).json({ error: 'Invalid token type' });
      }

      const user = await User.findByPk(decoded.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Update password
      await user.updatePassword(password);

      // Log the password reset
      await AuditLog.create({
        userId: user.id,
        action: 'PASSWORD_RESET',
        resourceType: 'user',
        resourceId: user.id,
        details: { email: user.email }
      });

      res.json({ message: 'Password reset successfully' });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(400).json({ error: 'Password reset token expired' });
      }
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(400).json({ error: 'Invalid password reset token' });
      }
      res.status(500).json({ error: 'Failed to reset password' });
    }
  }

  // Get all users (admin only)
  async getAllUsers(req: Request, res: Response) {
    try {
      const { page = 1, limit = 50, role, status } = req.query;
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const where: any = {};
      if (role) where.role = role;
      if (status) where.status = status;

      const users = await User.findAndCountAll({
        where,
        limit: parseInt(limit as string),
        offset,
        include: [
          {
            model: Profile,
            as: 'profile',
            attributes: ['fullName', 'phone']
          }
        ],
        attributes: { exclude: ['password'] },
        order: [['createdAt', 'DESC']]
      });

      res.json({
        total: users.count,
        page: parseInt(page as string),
        totalPages: Math.ceil(users.count / parseInt(limit as string)),
        users: users.rows
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Get user by ID (admin only)
  async getUserById(req: Request, res: Response) {
    try {
      const user = await User.findByPk(req.params.id, {
        include: [
          {
            model: Profile,
            as: 'profile',
            attributes: ['fullName', 'phone', 'dateOfBirth', 'address', 'avatarUrl']
          }
        ],
        attributes: { exclude: ['password'] }
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // Update user (admin only)
  async updateUser(req: Request, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userId = (req as any).user?.id;
      const previousStatus = user.status;
      const previousRole = user.role;

      await user.update(req.body);

      // Log the admin update
      await AuditLog.create({
        userId,
        action: 'ADMIN_USER_UPDATE',
        resourceType: 'user',
        resourceId: user.id,
        details: {
          previousStatus,
          newStatus: user.status,
          previousRole,
          newRole: user.role,
          updatedBy: userId
        }
      });

      res.json({
        message: 'User updated successfully',
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          status: user.status,
          twoFactorAuthentication: user.twoFactorAuthentication
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update user' });
    }
  }

  // Delete user (admin only)
  async deleteUser(req: Request, res: Response) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userId = (req as any).user?.id;

      // Log the deletion
      await AuditLog.create({
        userId,
        action: 'USER_DELETION',
        resourceType: 'user',
        resourceId: user.id,
        details: {
          email: user.email,
          role: user.role,
          deletedBy: userId
        }
      });

      await user.destroy();
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }

  // Enable/disable 2FA
  async toggleTwoFactorAuthentication(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { enable } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      user.twoFactorAuthentication = enable;
      await user.save();

      // Log the 2FA change
      await AuditLog.create({
        userId: userId,
        action: enable ? 'ENABLE_2FA' : 'DISABLE_2FA',
        resourceType: 'user',
        resourceId: userId,
        details: { email: user.email }
      });

      res.json({
        message: `Two-factor authentication ${enable ? 'enabled' : 'disabled'} successfully`,
        twoFactorAuthentication: user.twoFactorAuthentication
      });
    } catch (error) {
      res.status(500).json({ error: 'Failed to update two-factor authentication' });
    }
  }

  // Private helper methods
  private generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
  }

  private async sendVerificationEmail(email: string, token: string, code: string) {
    // In a real application, implement email sending
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;

    console.log(`Verification email sent to ${email}`);
    console.log(`Verification link: ${verificationLink}`);
    console.log(`Verification code: ${code}`);

    // Example using nodemailer or another email service
    await sendEmail({
      to: email,
      subject: 'Verify Your Email',
      html: `Click <a href="${verificationLink}">here</a> to verify your email. Your verification code is: ${code}`
    });
  }

  private async sendPasswordResetEmail(email: string, token: string) {
    // In a real application, implement email sending
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    console.log(`Password reset email sent to ${email}`);
    console.log(`Reset link: ${resetLink}`);

    // Example using nodemailer or another email service
    await sendEmail({
      to: email,
      subject: 'Reset Your Password',
      html: `Click <a href="${resetLink}">here</a> to reset your password.`
    });
  }
}

export default new UserController();