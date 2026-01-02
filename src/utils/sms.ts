
import Twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();

const sid = process.env.TWILIO_SID;
const token = process.env.TWILIO_TOKEN;
let client: any = null;
if (sid && token) client = Twilio(sid, token);

export const sendSms = async (to: string, body: string) => {
  if (!client) return;
  await client.messages.create({ body, from: process.env.TWILIO_PHONE as string, to });
};
