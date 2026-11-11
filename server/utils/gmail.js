
import dotenv from "dotenv";
import { google } from "googleapis";

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
});

const gmail = google.gmail({
    version: "v1",
    auth: oauth2Client,
});

export const sendGmailMessage = async (email, subject, html) => {
    const message = [
        `From: QUICK KART <${process.env.GMAIL_USER}>`,
        `To: ${email}`,
        `Subject: ${subject}`,
        "MIME-Version: 1.0",
        'Content-Type: text/html; charset="UTF-8"',
        "",
        html,
    ].join("\r\n");

    const raw = Buffer.from(message).toString("base64url");

    const response = await gmail.users.messages.send({
        userId: "me",
        requestBody: {
            raw,
        },
    });

    return response.data;
};
