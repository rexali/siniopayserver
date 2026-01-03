"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Profile_model_1 = __importDefault(require("../models/Profile.model"));
const express_validator_1 = require("express-validator");
const Account_model_1 = __importDefault(require("../models/Account.model"));
class ProfileController {
    // Get all profiles (admin only)
    async getAllProfiles(req, res) {
        try {
            const profiles = await Profile_model_1.default.findAll();
            res.json(profiles);
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Get profile by ID
    async getProfileById(req, res) {
        try {
            const profile = await Profile_model_1.default.findByPk(req.params.id);
            if (!profile) {
                return res.status(404).json({ error: 'Profile not found' });
            }
            res.json(profile);
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
    // Create profile
    async createProfile(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const profile = await Profile_model_1.default.create(req.body);
            if (profile !== null) {
                await Account_model_1.default.create({
                    userId: profile.id,
                    accountNumber: String(Math.floor(Math.random() * 10000000000))
                });
                res.status(201).json({
                    status: 'success',
                    data: { profile },
                    message: 'Account created'
                });
            }
            else {
                res.status(400).json({
                    status: 'fail',
                    data: null,
                    message: 'Account not created'
                });
            }
        }
        catch (error) {
            console.error(error);
            res.status(500).json({
                status: 'fail',
                data: null,
                message: 'Error! Failed to create an account'
            });
        }
    }
    // Update profile
    async updateProfile(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.error(errors.array());
            return res.status(400).json({ status: 'fail', data: null, message: 'Failed validation' });
        }
        try {
            const profile = await Profile_model_1.default.findOne({ where: { userId: req.params.id } });
            if (!profile) {
                return res.status(404).json({ status: 'fail', data: null, message: 'Profile not found' });
            }
            await profile.update(req.body);
            res.json({ status: 'success', data: { profile }, message: 'Profile updated' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ status: 'fail', data: null, message: 'Failed to update profile' });
        }
    }
    // Delete profile
    async deleteProfile(req, res) {
        try {
            const profile = await Profile_model_1.default.findByPk(req.params.id);
            if (!profile) {
                return res.status(404).json({ error: 'Profile not found' });
            }
            await profile.destroy();
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to delete profile' });
        }
    }
    // Get user's own profile
    async getMyProfile(req, res) {
        try {
            // Assuming user ID is available in req.user after authentication
            const userId = req.user?.id || req.params?.userId;
            console.log(req.user?.id);
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const profile = await Profile_model_1.default.findOne({
                where: {
                    userId
                }
            });
            if (!profile) {
                return res.status(404).json({ error: 'Profile not found' });
            }
            res.json({ status: "success", data: { profile }, message: 'Profile found' });
        }
        catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
exports.default = new ProfileController();
