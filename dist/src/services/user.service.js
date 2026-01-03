"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPassword = exports.getHashedPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const getHashedPassword = async (payload) => {
    const hashed = await bcrypt_1.default.hash(payload.password, 10);
    return hashed;
};
exports.getHashedPassword = getHashedPassword;
const verifyPassword = async (user, password) => {
    return bcrypt_1.default.compare(password, user.password);
};
exports.verifyPassword = verifyPassword;
