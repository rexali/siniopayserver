"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_jwt_1 = require("passport-jwt");
const dotenv_1 = __importDefault(require("dotenv"));
// import Admin from '../models/admin.model';
const User_model_1 = __importDefault(require("../models/User.model"));
dotenv_1.default.config();
const opts = {
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
};
passport_1.default.use('user-jwt', new passport_jwt_1.Strategy(opts, async (payload, done) => {
    try {
        const user = await User_model_1.default.findByPk(payload.id);
        if (user)
            return done(null, user);
        return done(null, false);
    }
    catch (err) {
        return done(err, false);
    }
}));
passport_1.default.use('admin-jwt', new passport_jwt_1.Strategy(opts, async (payload, done) => {
    try {
        // const admin = await Admin.findByPk((payload as any).id);
        // if (admin) return done(null, admin);
        return done(null, false);
    }
    catch (err) {
        return done(err, false);
    }
}));
exports.default = passport_1.default;
