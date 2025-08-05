
'use server';

import * as brevo from '@getbrevo/brevo';
import type { Location } from './types';

interface EmailParams {
  [key: string]: string | number | undefined;
}

// Ensure you have a .env file with your Brevo API Key
const BREVO_API_KEY = process.env.BREVO_API_KEY;

if (!BREVO_API_KEY) {
  console.warn("Brevo API key not found. Email sending will be disabled. Please add BREVO_API_KEY to your .env file.");
}

const api = new brevo.TransactionalEmailsApi();
api.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, BREVO_API_KEY!);

export async function sendEmail({ to, subject, body, params }: { to: string, subject: string, body: string, params: EmailParams }) {
  if (!BREVO_API_KEY) {
    console.log("--- Email disabled (no API key) ---");
    console.log("To:", to);
    console.log("Subject:", subject);
    console.log("Body:", renderTemplate(body, params));
    console.log("--- End Email ---");
    return;
  }

  // A simple template renderer
  const htmlContent = renderTemplate(body, params);

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.sender = { name: "Heavenkeys Booking", email: "noreply@heavenkeys.com" }; // Replace with your verified sender
  sendSmtpEmail.to = [{ email: to }];
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;

  try {
    await api.sendTransacEmail(sendSmtpEmail);
    console.log(`Email sent successfully to ${to}`);
  } catch (error) {
    console.error("Brevo API Error:", error);
    // Optionally re-throw or handle the error as needed
  }
}

function renderTemplate(template: string, params: EmailParams) {
  let rendered = template;
  for (const key in params) {
    const value = params[key];
    if (value !== undefined) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    }
  }
  return rendered;
}
