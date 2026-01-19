import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.model';
import UserDevice from '../models/UserDevice.model';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {

  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'fail', data: null, messsage: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;

    // Verify user exists and is active
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ status: 'fail', data: null, messsage: 'User not found.' });
    }

    // if (user.status !== 'active') {
    //   return res.status(403).json(
    //     { status: 'fail', data: null, messsage: 'Account is not active.' });
    // }

    // // Check if email is verified
    // if (!user.emailVerifiedAt) {
    //   return res.status(403).json({
    //     status: 'fail', data: null, messsage: 'Email not verified. Please verify your email to continue.',
    //     needsVerification: true
    //   });
    // }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const tokenIssuedAt = decoded.iat * 1000; // Convert to milliseconds
      if (user.passwordChangedAt.getTime() > tokenIssuedAt) {
        return res.status(401).json({status:'fail', data:null, messsage: 'Password was changed. Please login again.' });
      }
    }

    (req as any).user = {
      id: user.id,
      email: user.email,
      role: user.role,
      twoFactorAuthentication: user.twoFactorAuthentication
    };

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired. Please login again.' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    res.status(400).json({ error: 'Authentication failed.' });
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        error: 'Access denied. Insufficient permissions.',
        requiredRoles: roles,
        userRole
      });
    }

    next();
  };
};

// Middleware to check 2FA status
export const require2FA = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.twoFactorAuthentication) {
      // Check if 2FA was verified in this session
      // This would typically check a session variable or a short-lived token
      const twoFactorVerified = req.headers['x-2fa-verified'] === 'true';

      if (!twoFactorVerified) {
        return res.status(403).json({
          error: 'Two-factor authentication required',
          requires2FA: true
        });
      }
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Failed to check 2FA status' });
  }
};

// Middleware for sensitive operations (requires re-authentication)
export const requireReauthentication = async (req: Request, res: Response, next: NextFunction) => {
  const password = req.headers['x-reauth-password'];

  if (!password) {
    return res.status(401).json({
      error: 'Re-authentication required',
      requiresPassword: true
    });
  }

  const userId = (req as any).user?.id;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isValidPassword = await user.comparePassword(password as string);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid password' });
    }

    next();
  } catch (error) {
    res.status(500).json({ error: 'Re-authentication failed' });
  }
};

// Middleware to check device trust
export const requireTrustedDevice = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const deviceId = req.headers['x-device-id'] as string;

  if (!deviceId) {
    return res.status(400).json({ status:'fail', data:null, messsage: 'Device ID is required' });
  }

  try {
    const device = await UserDevice.findOne({
      where: {
        userId,
        deviceId,
        isActive: true,
        isTrusted: true
      }
    });

    if (!device) {
      return res.status(403).json({
        status:'fail', data:null, messsage: 'Trusted device required for this operation',
        requiresDeviceTrust: true
      });
    }

    next();
  } catch (error) {
    res.status(500).json({status:'fail', data:null, messsage: 'Failed to check device trust' });
  }
};

// Middleware to track device activity
export const trackDeviceActivity = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).user?.id;
  const deviceId = req.headers['x-device-id'] as string;

  if (userId && deviceId) {
    try {
      // Update device activity in background (don't block request)
      setTimeout(async () => {
        try {
          const device = await UserDevice.findOne({
            where: {
              userId,
              deviceId,
              isActive: true
            }
          });

          if (device) {
            await device.update({
              lastActivityAt: new Date()
            });
          }
        } catch (error) {
          console.error('Failed to update device activity:', error);
        }
      }, 0);
    } catch (error) {
      // Silently fail - don't interrupt the request
    }
  }

  next();
};