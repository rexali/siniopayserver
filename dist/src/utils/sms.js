"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSms = void 0;
const twilio_1 = __importDefault(require("twilio"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const sid = process.env.TWILIO_SID;
const token = process.env.TWILIO_TOKEN;
let client = null;
if (sid && token)
    client = (0, twilio_1.default)(sid, token);
const sendSms = async (to, body) => {
    if (!client)
        return;
    await client.messages.create({ body, from: process.env.TWILIO_PHONE, to });
};
exports.sendSms = sendSms;
