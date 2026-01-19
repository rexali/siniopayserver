"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmailByResend = sendEmailByResend;
exports.createContactByResend = createContactByResend;
const resend_1 = require("resend");
async function sendEmailByResend(params) {
    const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
    const { data, error } = await resend.emails.send({
        from: params.from || "Acme <onboarding@resend.dev>",
        to: params.to || ["delivered@resend.dev"],
        subject: params.subject || "hello world",
        html: params.html || "<strong>it works!</strong>",
    });
    if (error) {
        return error;
    }
    return data;
}
async function createContactByResend(params) {
    const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
    let { data, error } = await resend.contacts.create({
        email: params.eamil,
        // Provide dynamic values on your own
        firstName: params.firstName || 'Steve',
        lastName: params.lastName || 'Wozniak',
        unsubscribed: params.unsubscribed || false,
    });
    if (error) {
        return error;
    }
    return data;
}
