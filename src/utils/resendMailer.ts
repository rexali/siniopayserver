import { Resend } from "resend";

export async function sendEmailByResend(params: {
    from: string;
    to: string;
    subject: string;
    html: string;
}) {
    const resend = new Resend(process.env.RESEND_API_KEY)
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
export async function createContactByResend(params: {
    eamil: string;
    firstName?: string;
    lastName?: string;
    unsubscribed?: boolean;
}) {
    const resend = new Resend(process.env.RESEND_API_KEY)



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
