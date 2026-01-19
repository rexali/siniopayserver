"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const db_1 = require("../config/db");
const User_model_1 = __importDefault(require("./User.model"));
class UserDevice extends sequelize_1.Model {
    // Instance methods
    isExpired() {
        if (!this.expiresAt)
            return false;
        return new Date() > this.expiresAt;
    }
    isMobile() {
        const mobileTypes = ['mobile', 'tablet'];
        return mobileTypes.includes(this.deviceType || '');
    }
    isDesktop() {
        return this.deviceType === 'desktop';
    }
    getLocationString() {
        if (!this.location)
            return 'Unknown';
        const { city, region, country } = this.location;
        const parts = [];
        if (city)
            parts.push(city);
        if (region)
            parts.push(region);
        if (country)
            parts.push(country);
        return parts.length > 0 ? parts.join(', ') : 'Unknown';
    }
    getBrowserInfo() {
        if (!this.browser)
            return 'Unknown';
        return this.browserVersion
            ? `${this.browser} ${this.browserVersion}`
            : this.browser;
    }
    getOSInfo() {
        if (!this.operatingSystem)
            return 'Unknown';
        return this.osVersion
            ? `${this.operatingSystem} ${this.osVersion}`
            : this.operatingSystem;
    }
    toSafeJSON() {
        const { ipAddress, location, userAgent, fingerprint, metadata, ...safeData } = this.toJSON();
        return safeData;
    }
}
UserDevice.init({
    id: {
        type: sequelize_1.DataTypes.UUID,
        primaryKey: true,
        defaultValue: sequelize_1.DataTypes.UUIDV4
    },
    userId: {
        type: sequelize_1.DataTypes.UUID,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        },
        onDelete: 'CASCADE'
    },
    deviceId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
        validate: {
            notEmpty: true,
            len: [10, 255]
        }
    },
    deviceType: {
        type: sequelize_1.DataTypes.ENUM('desktop', 'mobile', 'tablet', 'smart_tv', 'wearable', 'unknown'),
        defaultValue: 'unknown'
    },
    deviceName: {
        type: sequelize_1.DataTypes.STRING,
        validate: {
            len: [0, 100]
        }
    },
    operatingSystem: {
        type: sequelize_1.DataTypes.STRING,
        validate: {
            len: [0, 50]
        }
    },
    osVersion: {
        type: sequelize_1.DataTypes.STRING,
        validate: {
            len: [0, 20]
        }
    },
    browser: {
        type: sequelize_1.DataTypes.STRING,
        validate: {
            len: [0, 50]
        }
    },
    browserVersion: {
        type: sequelize_1.DataTypes.STRING,
        validate: {
            len: [0, 20]
        }
    },
    ipAddress: {
        type: sequelize_1.DataTypes.STRING(45), // Supports IPv6 (45 chars)
        allowNull: false,
        validate: {
            isIP: true
        }
    },
    location: {
        type: sequelize_1.DataTypes.JSONB,
        defaultValue: {},
        validate: {
            isValidLocation(value) {
                if (value && typeof value !== 'object') {
                    throw new Error('Location must be an object');
                }
                if (value) {
                    const validFields = ['country', 'region', 'city', 'latitude', 'longitude', 'timezone'];
                    Object.keys(value).forEach(key => {
                        if (!validFields.includes(key)) {
                            throw new Error(`Invalid location field: ${key}`);
                        }
                    });
                }
            }
        }
    },
    userAgent: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        validate: {
            notEmpty: true
        }
    },
    isTrusted: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: false
    },
    isActive: {
        type: sequelize_1.DataTypes.BOOLEAN,
        defaultValue: true
    },
    lastLoginAt: {
        type: sequelize_1.DataTypes.DATE
    },
    lastActivityAt: {
        type: sequelize_1.DataTypes.DATE
    },
    expiresAt: {
        type: sequelize_1.DataTypes.DATE
    },
    fingerprint: {
        type: sequelize_1.DataTypes.STRING(64),
        validate: {
            len: [0, 64]
        }
    },
    metadata: {
        type: sequelize_1.DataTypes.JSONB,
        defaultValue: {}
    },
    createdAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    },
    updatedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW
    }
}, {
    sequelize: db_1.sequelize,
    tableName: 'user_devices',
    timestamps: true,
    indexes: [
        {
            fields: ['userId'],
            name: 'idx_user_devices_user_id'
        },
        {
            fields: ['deviceId'],
            name: 'idx_user_devices_device_id'
        },
        {
            fields: ['ipAddress'],
            name: 'idx_user_devices_ip_address'
        },
        {
            fields: ['isTrusted'],
            name: 'idx_user_devices_is_trusted'
        },
        {
            fields: ['isActive'],
            name: 'idx_user_devices_is_active'
        },
        {
            fields: ['lastActivityAt'],
            name: 'idx_user_devices_last_activity'
        },
        {
            fields: ['expiresAt'],
            name: 'idx_user_devices_expires_at'
        },
        {
            fields: ['userId', 'deviceId'],
            name: 'idx_user_devices_user_device_unique',
            unique: true
        }
    ],
    hooks: {
        beforeCreate: async (device) => {
            // Set default expiration (30 days from now)
            if (!device.expiresAt) {
                const expiresAt = new Date();
                expiresAt.setDate(expiresAt.getDate() + 30);
                device.expiresAt = expiresAt;
            }
            // Set initial timestamps
            device.lastLoginAt = new Date();
            device.lastActivityAt = new Date();
            // Parse user agent for additional info if not provided
            await parseUserAgentInfo(device);
        },
        beforeUpdate: async (device) => {
            // Update lastActivityAt on certain changes
            if (device.changed('isActive') || device.changed('isTrusted')) {
                device.lastActivityAt = new Date();
            }
        },
        afterCreate: async (device) => {
            // Send notification for new device login if not trusted
            if (!device.isTrusted) {
                await sendNewDeviceNotification(device);
            }
        }
    }
});
// Helper function to parse user agent
async function parseUserAgentInfo(device) {
    try {
        const UAParser = (await Promise.resolve().then(() => __importStar(require('ua-parser-js')))).default;
        const parser = new UAParser.UAParser(device.userAgent);
        const result = parser.getResult();
        // Set device type
        if (result.device.type) {
            device.deviceType = result.device.type;
        }
        // Set OS info
        if (result.os.name) {
            device.operatingSystem = result.os.name;
            device.osVersion = result.os.version || '';
        }
        // Set browser info
        if (result.browser.name) {
            device.browser = result.browser.name;
            device.browserVersion = result.browser.version || '';
        }
        // Set device name
        if (result.device.model) {
            device.deviceName = result.device.model;
        }
    }
    catch (error) {
        console.error('Failed to parse user agent:', error);
    }
}
// Helper function to send new device notification
async function sendNewDeviceNotification(device) {
    try {
        const Notification = (await Promise.resolve().then(() => __importStar(require('./Notification.model')))).default;
        const user = await User_model_1.default.findByPk(device.userId);
        if (!user)
            return;
        await Notification.create({
            userId: device.userId,
            type: 'alert',
            title: 'New Device Login Detected',
            message: `A new device (${device.getOSInfo()}, ${device.getBrowserInfo()}) has logged into your account from ${device.getLocationString()}.`,
            metadata: {
                deviceId: device.id,
                deviceType: device.deviceType,
                operatingSystem: device.operatingSystem,
                browser: device.browser,
                ipAddress: device.ipAddress,
                location: device.location,
                timestamp: device.lastLoginAt
            }
        });
    }
    catch (error) {
        console.error('Failed to send new device notification:', error);
    }
}
// Set up associations
UserDevice.belongsTo(User_model_1.default, {
    foreignKey: 'userId',
    as: 'user'
});
User_model_1.default.hasMany(UserDevice, {
    foreignKey: 'userId',
    as: 'devices'
});
exports.default = UserDevice;
