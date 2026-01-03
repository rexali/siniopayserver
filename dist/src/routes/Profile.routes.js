"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Profile_controller_1 = __importDefault(require("../controllers/Profile.controller"));
const Profile_validator_1 = require("../validators/Profile.validator");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Public routes
router.get('/my-profile/:userId', auth_1.authenticate, Profile_controller_1.default.getMyProfile);
router.patch('/update/:id', auth_1.authenticate, Profile_validator_1.validateProfileUpdate, Profile_controller_1.default.updateProfile);
// Admin routes
router.get('/', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), Profile_controller_1.default.getAllProfiles);
router.get('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), Profile_controller_1.default.getProfileById);
router.post('/', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), Profile_validator_1.validateProfile, Profile_controller_1.default.createProfile);
router.patch('/:id', auth_1.authenticate, (0, auth_1.authorize)(['admin', 'super_admin']), Profile_validator_1.validateProfile, Profile_controller_1.default.updateProfile);
router.delete('/:id', auth_1.authenticate, (0, auth_1.authorize)(['super_admin']), Profile_controller_1.default.deleteProfile);
exports.default = router;
