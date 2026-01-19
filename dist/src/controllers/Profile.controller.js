"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Profile_model_1 = __importDefault(require("../models/Profile.model"));
const express_validator_1 = require("express-validator");
const Account_model_1 = __importDefault(require("../models/Account.model"));
const uploadFile_1 = require("../utils/uploadFile");
const multer_1 = __importDefault(require("multer"));
const filterFilesByName_1 = require("../utils/filterFilesByName");
const User_model_1 = __importDefault(require("../models/User.model"));
class ProfileController {
    // Get all profiles (admin only)
    async getAllProfiles(req, res) {
        try {
            const profiles = await Profile_model_1.default.findAll({
                include: {
                    model: User_model_1.default,
                    as: 'user',
                    required: false
                }
            });
            res.status(200).json({ status: 'success', data: { profiles }, message: 'Profile found' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Get profile by ID
    async getProfileById(req, res) {
        try {
            const profile = await Profile_model_1.default.findByPk(req.params.id);
            if (!profile) {
                return res.status(404).json({ status: 'fail', data: null, message: 'Profile not found' });
            }
            res.status(200).json({ status: 'success', data: { profile }, message: 'Profile found' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ status: 'fail', data: null, message: 'Internal server error' });
        }
    }
    // Create profile
    async createProfile(req, res) {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        (0, uploadFile_1.uploadFiles)()(req, res, async function (err) {
            if (err instanceof multer_1.default.MulterError) {
                // A Multer error occurred when uploading.
                throw new Error(err.message);
            }
            else if (err) {
                // An unknown error occurred when uploading.
                throw new Error(err);
            }
            ;
            // TO DO
            // Here Everything went fine, send the file name and other fields to database 
            try {
                let avatarUrl, ninUrl, addressUrl;
                if (req.files?.length) { // loop thru the file and add
                    // const data = req.body as HotelType;
                    if ((0, filterFilesByName_1.filterFilesByName)(req.files, 'image').length) {
                        avatarUrl = (0, filterFilesByName_1.filterFilesByName)(req.files, 'image')[0];
                    }
                    else {
                        avatarUrl = '';
                    }
                    if ((0, filterFilesByName_1.filterFilesByName)(req.files, 'addressDoc').length) {
                        addressUrl = (0, filterFilesByName_1.filterFilesByName)(req.files, 'addressDoc')[0];
                    }
                    else {
                        addressUrl = '';
                    }
                    if ((0, filterFilesByName_1.filterFilesByName)(req.files, 'ninDoc').length) {
                        ninUrl = (0, filterFilesByName_1.filterFilesByName)(req.files, 'ninDoc')[0];
                    }
                    else {
                        ninUrl = '';
                    }
                }
                else {
                    console.log('No file(s)');
                }
                const data = {
                    ...req.body,
                    avatarUrl,
                    ninUrl,
                    addressUrl
                };
                const profile = await Profile_model_1.default.create(data);
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
        });
    }
    // Update profile
    async updateProfile(req, res) {
        console.log('current working directory', process.cwd());
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            console.error(errors.array());
            return res.status(400).json({ status: 'fail', data: null, message: 'Failed validation' });
        }
        (0, uploadFile_1.uploadFiles)()(req, res, async function (err) {
            if (err instanceof multer_1.default.MulterError) {
                // A Multer error occurred when uploading.
                throw new Error(err.message);
            }
            else if (err) {
                // An unknown error occurred when uploading.
                throw new Error(err);
            }
            ;
            // TO DO
            // Here Everything went fine, send the file name and other fields to database 
            try {
                let avatarUrl, ninUrl, addressUrl;
                if (req.files?.length) { // loop thru the file and add
                    // const data = req.body as HotelType;
                    if ((0, filterFilesByName_1.filterFilesByName)(req.files, 'image').length) {
                        avatarUrl = (0, filterFilesByName_1.filterFilesByName)(req.files, 'image')[0];
                    }
                    else {
                        let profile = await Profile_model_1.default.findByPk(req.user.id);
                        avatarUrl = profile?.avatarUrl;
                    }
                    if ((0, filterFilesByName_1.filterFilesByName)(req.files, 'address').length) {
                        addressUrl = (0, filterFilesByName_1.filterFilesByName)(req.files, 'address')[0];
                    }
                    else {
                        let profile = await Profile_model_1.default.findByPk(req.user.id);
                        addressUrl = profile?.addressUrl;
                    }
                    if ((0, filterFilesByName_1.filterFilesByName)(req.files, 'nin').length) {
                        ninUrl = (0, filterFilesByName_1.filterFilesByName)(req.files, 'nin')[0];
                    }
                    else {
                        let profile = await Profile_model_1.default.findByPk(req.user.id);
                        ninUrl = profile?.ninUrl;
                    }
                }
                else {
                    console.log('No file(s)');
                }
                const data = {
                    ...req.body,
                    avatarUrl,
                    ninUrl,
                    addressUrl
                };
                const profile = await Profile_model_1.default.findOne({ where: { userId: req.params.id } });
                if (!profile) {
                    return res.status(404).json({ status: 'fail', data: null, message: 'Profile not found' });
                }
                await profile.update(data);
                res.status(200).json({ status: 'success', data: { profile }, message: 'Profile updated' });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ status: 'fail', data: null, message: 'Failed to update profile' });
            }
        });
    }
    // Delete profile
    async deleteProfile(req, res) {
        try {
            const profile = await Profile_model_1.default.findByPk(req.params.id);
            if (!profile) {
                return res.status(404).json({ error: 'Profile not found' });
            }
            await profile.destroy();
            res.status(204).json({ status: 'success', data: {}, message: 'Profile deleted' });
        }
        catch (error) {
            res.status(500).json({ status: 'fail', data: null, message: 'Failed to delete profile' });
        }
    }
    // Get user's own profile
    async getMyProfile(req, res) {
        try {
            // Assuming user ID is available in req.user after authentication
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ status: "fail", data: null, message: 'Unauthorized' });
            }
            const profile = await Profile_model_1.default.findOne({
                where: {
                    userId
                }
            });
            if (!profile) {
                return res.status(404).json({ status: "fail", data: null, message: 'Profile not found' });
            }
            res.status(200).json({ status: "success", data: { profile }, message: 'Profile found' });
        }
        catch (error) {
            console.error(error);
            res.status(500).json({ status: "fail", data: null, message: 'Internal server error' });
        }
    }
}
exports.default = new ProfileController();
