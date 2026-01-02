
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (data:{to: string, subject: string, html?: string, text?: string}) => {
  if (!process.env.SMTP_USER) return;
  await transporter.sendMail({ from: process.env.SMTP_USER, to: data.to, subject: data.subject, text: data.text });
};
