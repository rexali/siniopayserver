import { 
  CreationOptional, 
  DataTypes, 
  InferAttributes, 
  InferCreationAttributes, 
  Model, 
  ForeignKey 
} from 'sequelize';
import { sequelize } from '../config/db';
import User from './User.model';

class UserDevice extends Model<
  InferAttributes<UserDevice>, 
  InferCreationAttributes<UserDevice>
> {
  declare id: CreationOptional<string>;
  declare userId: ForeignKey<string>;
  declare deviceId: string;
  declare deviceType: CreationOptional<string>;
  declare deviceName: CreationOptional<string>;
  declare operatingSystem: CreationOptional<string>;
  declare osVersion: CreationOptional<string>;
  declare browser: CreationOptional<string>;
  declare browserVersion: CreationOptional<string>;
  declare ipAddress: string;
  declare location: CreationOptional<any>;
  declare userAgent: string;
  declare isTrusted: CreationOptional<boolean>;
  declare isActive: CreationOptional<boolean>;
  declare lastLoginAt: CreationOptional<Date>;
  declare lastActivityAt: CreationOptional<Date>;
  declare expiresAt: CreationOptional<Date>;
  declare fingerprint: CreationOptional<string>;
  declare metadata: CreationOptional<any>;
  declare createdAt: CreationOptional<Date>;
  declare updatedAt: CreationOptional<Date>;

  // Virtual associations
  declare user?: User;

  // Instance methods
  isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  isMobile(): boolean {
    const mobileTypes = ['mobile', 'tablet'];
    return mobileTypes.includes(this.deviceType || '');
  }

  isDesktop(): boolean {
    return this.deviceType === 'desktop';
  }

  getLocationString(): string {
    if (!this.location) return 'Unknown';
    
    const { city, region, country } = this.location;
    const parts = [];
    if (city) parts.push(city);
    if (region) parts.push(region);
    if (country) parts.push(country);
    
    return parts.length > 0 ? parts.join(', ') : 'Unknown';
  }

  getBrowserInfo(): string {
    if (!this.browser) return 'Unknown';
    return this.browserVersion 
      ? `${this.browser} ${this.browserVersion}`
      : this.browser;
  }

  getOSInfo(): string {
    if (!this.operatingSystem) return 'Unknown';
    return this.osVersion
      ? `${this.operatingSystem} ${this.osVersion}`
      : this.operatingSystem;
  }

  toSafeJSON() {
    const { ipAddress, location, userAgent, fingerprint, metadata, ...safeData } = this.toJSON();
    return safeData;
  }
}

UserDevice.init(
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    deviceId: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [10, 255]
      }
    },
    deviceType: {
      type: DataTypes.ENUM('desktop', 'mobile', 'tablet', 'smart_tv', 'wearable', 'unknown'),
      defaultValue: 'unknown'
    },
    deviceName: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 100]
      }
    },
    operatingSystem: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 50]
      }
    },
    osVersion: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 20]
      }
    },
    browser: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 50]
      }
    },
    browserVersion: {
      type: DataTypes.STRING,
      validate: {
        len: [0, 20]
      }
    },
    ipAddress: {
      type: DataTypes.STRING(45), // Supports IPv6 (45 chars)
      allowNull: false,
      validate: {
        isIP: true
      }
    },
    location: {
      type: DataTypes.JSONB,
      defaultValue: {},
      validate: {
        isValidLocation(value: any) {
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
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    isTrusted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    lastLoginAt: {
      type: DataTypes.DATE
    },
    lastActivityAt: {
      type: DataTypes.DATE
    },
    expiresAt: {
      type: DataTypes.DATE
    },

    fingerprint: {
      type: DataTypes.STRING(64),
      validate: {
        len: [0, 64]
      }
    },
    metadata: {
      type: DataTypes.JSONB,
      defaultValue: {}
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
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
      beforeCreate: async (device: UserDevice) => {
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
      beforeUpdate: async (device: UserDevice) => {
        // Update lastActivityAt on certain changes
        if (device.changed('isActive') || device.changed('isTrusted')) {
          device.lastActivityAt = new Date();
        }
      },
      afterCreate: async (device: UserDevice) => {
        // Send notification for new device login if not trusted
        if (!device.isTrusted) {
          await sendNewDeviceNotification(device);
        }
      }
    }
  }
);

// Helper function to parse user agent
async function parseUserAgentInfo(device: UserDevice) {
  try {
    const UAParser = (await import('ua-parser-js')).default;
    const parser = new UAParser.UAParser(device.userAgent);
    const result = parser.getResult();

    // Set device type
    if (result.device.type) {
      device.deviceType = result.device.type as any;
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
  } catch (error) {
    console.error('Failed to parse user agent:', error);
  }
}

// Helper function to send new device notification
async function sendNewDeviceNotification(device: UserDevice) {
  try {
    const Notification = (await import('./Notification.model')).default;
    const user = await User.findByPk(device.userId);
    
    if (!user) return;

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
  } catch (error) {
    console.error('Failed to send new device notification:', error);
  }
}

// Set up associations
UserDevice.belongsTo(User, { 
  foreignKey: 'userId', 
  as: 'user' 
});

User.hasMany(UserDevice, { 
  foreignKey: 'userId', 
  as: 'devices' 
});

export default UserDevice;