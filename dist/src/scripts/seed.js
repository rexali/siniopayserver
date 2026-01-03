"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("../config/db");
const User_model_1 = __importDefault(require("../models/User.model")); // Add this import
const Profile_model_1 = __importDefault(require("../models/Profile.model"));
const Account_model_1 = __importDefault(require("../models/Account.model"));
const FAQ_model_1 = __importDefault(require("../models/FAQ.model"));
const ComplianceSetting_model_1 = __importDefault(require("../models/ComplianceSetting.model"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const seedDatabase = async () => {
    try {
        console.log('Starting database seeding...');
        // Clear existing data
        await db_1.sequelize.sync({ force: true });
        console.log('Database cleared');
        // Create users with hashed passwords
        const adminPassword = await bcrypt_1.default.hash('Admin@123', 12);
        const customerPassword = await bcrypt_1.default.hash('Customer@123', 12);
        // Create admin user
        const adminUser = await User_model_1.default.create({
            id: '00000000-0000-0000-0000-000000000001',
            email: 'admin@fintech.com',
            password: adminPassword,
            role: 'super_admin',
            status: 'active',
            emailVerifiedAt: new Date(),
            twoFactorAuthentication: false
        });
        // Create customer user
        const customerUser = await User_model_1.default.create({
            id: '00000000-0000-0000-0000-000000000002',
            email: 'customer@example.com',
            password: customerPassword,
            role: 'customer',
            status: 'active',
            emailVerifiedAt: new Date(),
            twoFactorAuthentication: false
        });
        console.log('Users created');
        // Create profiles for users
        await Profile_model_1.default.create({
            userId: adminUser.id,
            fullName: 'System Administrator',
            phone: '+12345678901'
        });
        await Profile_model_1.default.create({
            userId: customerUser.id,
            fullName: 'John Doe',
            phone: '+12345678902',
            dateOfBirth: '1990-01-01',
            address: {
                street: '123 Main St',
                city: 'New York',
                state: 'NY',
                country: 'USA',
                zipCode: '10001'
            }
        });
        console.log('Profiles created');
        // Create accounts
        const adminAccount = await Account_model_1.default.create({
            userId: adminUser.id,
            accountNumber: 'ADMIN001',
            accountType: 'wallet',
            balance: 1000000.00,
            currency: 'USD'
        });
        const customerAccount = await Account_model_1.default.create({
            userId: customerUser.id,
            accountNumber: 'CUST001',
            accountType: 'wallet',
            balance: 5000.00,
            currency: 'USD'
        });
        console.log('Accounts created');
        // Create FAQ entries
        const faqs = [
            {
                question: 'How do I create an account?',
                answer: 'Click on the "Sign Up" button, fill in your details, verify your email, and complete the KYC process.',
                category: 'Account',
                orderIndex: 1
            },
            {
                question: 'What is the minimum deposit amount?',
                answer: 'The minimum deposit amount is $10.',
                category: 'Transactions',
                orderIndex: 2
            },
            {
                question: 'How long do withdrawals take?',
                answer: 'Withdrawals typically take 1-3 business days to process.',
                category: 'Transactions',
                orderIndex: 3
            },
            {
                question: 'Is my money safe?',
                answer: 'Yes, we use bank-grade security and your funds are held in segregated accounts.',
                category: 'Security',
                orderIndex: 4
            },
            {
                question: 'What are the transaction fees?',
                answer: 'We charge 1% for transactions under $1000 and 0.5% for transactions above $1000.',
                category: 'Fees',
                orderIndex: 5
            }
        ];
        await FAQ_model_1.default.bulkCreate(faqs);
        console.log('FAQs created');
        // Create compliance settings
        const complianceSettings = [
            {
                settingType: 'transaction_limit',
                settingKey: 'daily_limit',
                settingValue: { value: 10000, currency: 'USD' },
                active: true
            },
            {
                settingType: 'transaction_limit',
                settingKey: 'per_transaction_limit',
                settingValue: { value: 5000, currency: 'USD' },
                active: true
            },
            {
                settingType: 'transaction_limit',
                settingKey: 'monthly_limit',
                settingValue: { value: 50000, currency: 'USD' },
                active: true
            },
            {
                settingType: 'aml_rule',
                settingKey: 'suspicious_amount_threshold',
                settingValue: { value: 10000, currency: 'USD' },
                active: true
            },
            {
                settingType: 'aml_rule',
                settingKey: 'require_kyc_for_transfer',
                settingValue: { value: true, threshold: 1000 },
                active: true
            },
            {
                settingType: 'security_policy',
                settingKey: 'password_policy',
                settingValue: {
                    minLength: 8,
                    requireUppercase: true,
                    requireLowercase: true,
                    requireNumbers: true,
                    requireSpecialChars: true
                },
                active: true
            },
            {
                settingType: 'security_policy',
                settingKey: 'session_timeout',
                settingValue: { minutes: 30 },
                active: true
            }
        ];
        await ComplianceSetting_model_1.default.bulkCreate(complianceSettings);
        console.log('Compliance settings created');
        console.log('Database seeding completed successfully!');
        console.log('\n--- Test Credentials ---');
        console.log('Admin: admin@fintech.com / Admin@123');
        console.log('Customer: customer@example.com / Customer@123');
        console.log('\n--- API Endpoints ---');
        console.log('Health check: GET /health');
        console.log('API Docs: GET /api-docs');
        console.log('Register: POST /api/auth/register');
        console.log('Login: POST /api/auth/login');
        process.exit(0);
    }
    catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};
seedDatabase();
