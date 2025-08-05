
import { sendEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { to, subject, body } = await req.json();

        if (!to || !subject || !body) {
            return NextResponse.json({ message: 'Missing required fields: to, subject, body' }, { status: 400 });
        }

        // We can use the existing sendEmail function.
        // The `params` argument is optional, so we can omit it for custom emails.
        await sendEmail({
            to,
            subject,
            body,
            params: {} // Pass empty params object as it's required
        });

        return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });

    } catch (error) {
        console.error('API Error sending custom email:', error);
        return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
    }
}
