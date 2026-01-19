import { Request, Response } from 'express';
import UserDevice from '../models/UserDevice.model';
import User from '../models/User.model';
import { validationResult } from 'express-validator';
import { col, fn, Op } from 'sequelize';
import AuditLog from '../models/AuditLog.model';
import geoip from 'geoip-lite'; // You'll need to install this package

class UserDeviceController {
    // Get all devices for current user
    async getMyDevices(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const {
                page = 1,
                limit = 20,
                activeOnly = 'true',
                trustedOnly = 'false'
            } = req.query;

            const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

            // Build where clause
            const where: any = { userId };

            if (activeOnly === 'true') {
                where.isActive = true;
            }

            if (trustedOnly === 'true') {
                where.isTrusted = true;
            }

            const { rows: devices, count: total } = await UserDevice.findAndCountAll({
                where,
                limit: parseInt(limit as string),
                offset,
                order: [
                    ['isActive', 'DESC'],
                    ['lastActivityAt', 'DESC'],
                    ['createdAt', 'DESC']
                ]
            });

            // Format devices for response
            const formattedDevices = devices.map(device => ({
                id: device.id,
                deviceType: device.deviceType,
                deviceName: device.deviceName,
                operatingSystem: device.operatingSystem,
                browser: device.browser,
                location: device.getLocationString(),
                isTrusted: device.isTrusted,
                isActive: device.isActive,
                lastLoginAt: device.lastLoginAt,
                lastActivityAt: device.lastActivityAt,
                isCurrentDevice: device.deviceId === req.headers['x-device-id']
            }));

            res.json({
                success: true,
                data: formattedDevices,
                pagination: {
                    total,
                    page: parseInt(page as string),
                    limit: parseInt(limit as string),
                    totalPages: Math.ceil(total / parseInt(limit as string))
                }
            });
        } catch (error) {
            console.error('Error getting user devices:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Get device by ID
    async getDeviceById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = (req as any).user?.id;
            const userRole = (req as any).user?.role;

            const device = await UserDevice.findByPk(id, {
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'email', 'fullName']
                    }
                ]
            });

            if (!device) {
                return res.status(404).json({ error: 'Device not found' });
            }

            // Check permissions
            if (userRole !== 'admin' && userRole !== 'super_admin' && device.userId !== userId) {
                return res.status(403).json({
                    error: 'You do not have permission to view this device'
                });
            }

            res.json({
                success: true,
                data: device
            });
        } catch (error) {
            console.error('Error getting device by ID:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Register a new device
    async registerDevice(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const userId = (req as any).user?.id;
            const {
                deviceId,
                deviceName,
                deviceType,
                userAgent,
                fingerprint
            } = req.body;

            // Get IP address from request
            const ipAddress = this.getClientIP(req);

            // Get location from IP
            const location = await this.getLocationFromIP(ipAddress);

            // Check if device already exists for this user
            const existingDevice = await UserDevice.findOne({
                where: {
                    userId,
                    deviceId,
                    isActive: true
                }
            });

            let device;

            if (existingDevice) {
                // Update existing device
                device = await existingDevice.update({
                    deviceName,
                    deviceType,
                    userAgent,
                    fingerprint,
                    ipAddress,
                    location,
                    lastLoginAt: new Date(),
                    lastActivityAt: new Date(),
                    isActive: true
                });
            } else {
                // Create new device
                device = await UserDevice.create({
                    userId,
                    deviceId,
                    deviceName,
                    deviceType,
                    userAgent,
                    fingerprint,
                    ipAddress,
                    location,
                    isTrusted: false,
                    isActive: true
                });
            }

            // Log the device registration
            await AuditLog.create({
                userId: userId,
                action: 'DEVICE_REGISTRATION',
                resourceType: 'user_device',
                resourceId: device.id,
                details: {
                    deviceId: device.deviceId,
                    deviceType: device.deviceType,
                    ipAddress: device.ipAddress,
                    location: device.location,
                    isNewDevice: !existingDevice
                }
            });

            res.status(201).json({
                success: true,
                message: existingDevice ? 'Device updated' : 'Device registered',
                data: device.toSafeJSON()
            });
        } catch (error: any) {
            console.error('Error registering device:', error);
            res.status(500).json({
                error: 'Failed to register device',
                details: error.message
            });
        }
    }

    // Update device (mark as trusted, rename, etc.)
    async updateDevice(req: Request, res: Response) {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { id } = req.params;
            const userId = (req as any).user?.id;
            const userRole = (req as any).user?.role;
            const {
                deviceName,
                isTrusted,
                isActive
            } = req.body;

            // Find the device
            const device = await UserDevice.findByPk(id);
            if (!device) {
                return res.status(404).json({ error: 'Device not found' });
            }

            // Check permissions
            if (userRole !== 'admin' && userRole !== 'super_admin' && device.userId !== userId) {
                return res.status(403).json({
                    error: 'You do not have permission to update this device'
                });
            }

            // Store previous values for audit log
            const previousData = {
                deviceName: device.deviceName,
                isTrusted: device.isTrusted,
                isActive: device.isActive
            };

            // Update device
            const updateData: any = {};
            if (deviceName !== undefined) updateData.deviceName = deviceName;
            if (isTrusted !== undefined) updateData.isTrusted = isTrusted;
            if (isActive !== undefined) updateData.isActive = isActive;

            await device.update(updateData);

            // Log the update
            await AuditLog.create({
                userId: userId,
                action: 'DEVICE_UPDATE',
                resourceType: 'user_device',
                resourceId: device.id,
                details: {
                    previousData,
                    newData: {
                        deviceName: device.deviceName,
                        isTrusted: device.isTrusted,
                        isActive: device.isActive
                    },
                    updatedBy: userId
                }
            });

            res.json({
                success: true,
                message: 'Device updated successfully',
                data: device.toSafeJSON()
            });
        } catch (error: any) {
            console.error('Error updating device:', error);
            res.status(500).json({
                error: 'Failed to update device',
                details: error.message
            });
        }
    }

    // Delete/remove device
    async deleteDevice(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const userId = (req as any).user?.id;
            const userRole = (req as any).user?.role;

            // Find the device
            const device = await UserDevice.findByPk(id);
            if (!device) {
                return res.status(404).json({ error: 'Device not found' });
            }

            // Check permissions
            if (userRole !== 'admin' && userRole !== 'super_admin' && device.userId !== userId) {
                return res.status(403).json({
                    error: 'You do not have permission to delete this device'
                });
            }

            // Log the deletion
            await AuditLog.create({
                userId: userId,
                action: 'DEVICE_DELETION',
                resourceType: 'user_device',
                resourceId: device.id,
                details: {
                    deviceId: device.deviceId,
                    deviceType: device.deviceType,
                    lastActivityAt: device.lastActivityAt
                }
            });

            // Soft delete (set inactive)
            await device.update({ isActive: false });

            res.json({
                success: true,
                message: 'Device removed successfully'
            });
        } catch (error: any) {
            console.error('Error deleting device:', error);
            res.status(500).json({
                error: 'Failed to remove device',
                details: error.message
            });
        }
    }

    // Revoke all devices except current one
    async revokeOtherDevices(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const currentDeviceId = req.headers['x-device-id'] as string;

            if (!currentDeviceId) {
                return res.status(400).json({ error: 'Current device ID is required' });
            }

            // Update all devices except current one to inactive
            const result = await UserDevice.update(
                { isActive: false },
                {
                    where: {
                        userId,
                        deviceId: { [Op.ne]: currentDeviceId },
                        isActive: true
                    }
                }
            );

            // Log the action
            await AuditLog.create({
                userId: userId,
                action: 'REVOKE_OTHER_DEVICES',
                resourceType: 'user_device',
                details: {
                    devicesRevoked: result[0],
                    currentDeviceId,
                    timestamp: new Date()
                }
            });

            res.json({
                success: true,
                message: `Revoked ${result[0]} other device(s)`,
                devicesRevoked: result[0]
            });
        } catch (error: any) {
            console.error('Error revoking other devices:', error);
            res.status(500).json({
                error: 'Failed to revoke other devices',
                details: error.message
            });
        }
    }

    // Get device statistics
    async getDeviceStatistics(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            const userRole = (req as any).user?.role;

            // Build query conditions
            const where: any = {};
            if (userRole === 'customer') {
                where.userId = userId;
            }

            const statistics = await UserDevice.findAll({
                where,
                attributes: [
                    'deviceType',
                    [fn('COUNT', col('id')), 'count']
                ],
                group: ['deviceType']
            });

            const activeDevices = await UserDevice.count({
                where: { ...where, isActive: true }
            });

            const trustedDevices = await UserDevice.count({
                where: { ...where, isTrusted: true, isActive: true }
            });

            // Get device activity over time
            const activityData = await UserDevice.findAll({
                where,
                attributes: [
                    [fn('DATE', col('lastActivityAt')), 'date'],
                    [fn('COUNT', col('id')), 'activeDevices']
                ],
                group: [fn('DATE', col('lastActivityAt'))],
                order: [[fn('DATE', col('lastActivityAt')), 'DESC']],
                limit: 30
            });

            res.json({
                success: true,
                data: {
                    totalDevices: statistics.reduce((total, stat: any) =>
                        total + parseInt(stat.get('count')), 0
                    ),
                    activeDevices,
                    trustedDevices,
                    byDeviceType: statistics.map((stat: any) => ({
                        deviceType: stat.get('deviceType'),
                        count: stat.get('count')
                    })),
                    activityOverTime: activityData.map((stat: any) => ({
                        date: stat.get('date'),
                        activeDevices: stat.get('activeDevices')
                    }))
                }
            });
        } catch (error) {
            console.error('Error getting device statistics:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Check if device is trusted
    async checkDeviceTrust(req: Request, res: Response) {
        try {
            const { deviceId } = req.params;
            const userId = (req as any).user?.id;

            const device = await UserDevice.findOne({
                where: {
                    userId,
                    deviceId,
                    isActive: true
                }
            });

            if (!device) {
                return res.status(404).json({
                    error: 'Device not found or inactive',
                    isTrusted: false,
                    requiresVerification: true
                });
            }

            // Check if device is expired
            if (device.isExpired()) {
                await device.update({ isActive: false });
                return res.status(410).json({
                    error: 'Device session expired',
                    isTrusted: false,
                    requiresReauthentication: true
                });
            }

            res.json({
                success: true,
                isTrusted: device.isTrusted,
                device: {
                    id: device.id,
                    deviceType: device.deviceType,
                    deviceName: device.deviceName,
                    lastLoginAt: device.lastLoginAt,
                    location: device.getLocationString()
                }
            });
        } catch (error) {
            console.error('Error checking device trust:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Update device activity (heartbeat)
    async updateDeviceActivity(req: Request, res: Response) {
        try {
            const { deviceId } = req.params;
            const userId = (req as any).user?.id;

            const device = await UserDevice.findOne({
                where: {
                    userId,
                    deviceId,
                    isActive: true
                }
            });

            if (!device) {
                return res.status(404).json({ error: 'Device not found' });
            }

            // Update last activity
            await device.update({
                lastActivityAt: new Date()
            });

            res.json({
                success: true,
                message: 'Device activity updated',
                lastActivityAt: device.lastActivityAt
            });
        } catch (error) {
            console.error('Error updating device activity:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Get suspicious devices (admin only)
    async getSuspiciousDevices(req: Request, res: Response) {
        try {
            const {
                page = 1,
                limit = 50,
                startDate,
                endDate
            } = req.query;

            const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

            const where: any = {
                isTrusted: false,
                lastLoginAt: {
                    [Op.gte]: startDate ? new Date(startDate as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
                }
            };

            if (endDate) {
                where.lastLoginAt = {
                    ...where.lastLoginAt,
                    [Op.lte]: new Date(endDate as string)
                };
            }

            const { rows: devices, count: total } = await UserDevice.findAndCountAll({
                where,
                limit: parseInt(limit as string),
                offset,
                include: [
                    {
                        model: User,
                        as: 'user',
                        attributes: ['id', 'email', 'fullName', 'status']
                    }
                ],
                order: [['lastLoginAt', 'DESC']]
            });

            res.json({
                success: true,
                data: devices,
                pagination: {
                    total,
                    page: parseInt(page as string),
                    limit: parseInt(limit as string),
                    totalPages: Math.ceil(total / parseInt(limit as string))
                }
            });
        } catch (error) {
            console.error('Error getting suspicious devices:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    // Helper method to get client IP
    private getClientIP(req: Request): string {
        const forwarded = req.headers['x-forwarded-for'];
        if (typeof forwarded === 'string') {
            return forwarded.split(',')[0].trim();
        }
        if (Array.isArray(forwarded)) {
            return forwarded[0].trim();
        }
        return req.ip || req.socket.remoteAddress || '127.0.0.1';
    }

    // Helper method to get location from IP
    private async getLocationFromIP(ipAddress: string): Promise<any> {
        try {
            // Use geoip-lite or similar service
            const geo = geoip.lookup(ipAddress);

            if (geo) {
                return {
                    country: geo.country,
                    region: geo.region,
                    city: geo.city,
                    latitude: geo.ll?.[0],
                    longitude: geo.ll?.[1],
                    timezone: geo.timezone
                };
            }

            // Fallback to IP geolocation API
            const response = await fetch(`http://ip-api.com/json/${ipAddress}`);
            const data = await response.json();

            if (data.status === 'success') {
                return {
                    country: data.country,
                    region: data.regionName,
                    city: data.city,
                    latitude: data.lat,
                    longitude: data.lon,
                    timezone: data.timezone
                };
            }

            return {};
        } catch (error) {
            console.error('Failed to get location from IP:', error);
            return {};
        }
    }
}

export default new UserDeviceController();