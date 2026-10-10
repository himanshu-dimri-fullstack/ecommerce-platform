import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendPasswordOnMail = async (email, password) => {
    try {
        const result = await transport.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "Your Account Password",
            html: `
            <div style="
                margin: 0;
                padding: 40px 20px;
                background-color: #f8fafc;
                font-family: Arial, Helvetica, sans-serif;
            ">

                <div style="
                    max-width: 520px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
                ">

                    <!-- Header -->
                    <div style="
                        background: linear-gradient(
                            135deg,
                            #064e3b,
                            #047857,
                            #022c22
                        );
                        padding: 32px 30px;
                        text-align: center;
                    ">

                        <div style="
                            width: 52px;
                            height: 52px;
                            margin: 0 auto 16px;
                            border-radius: 14px;
                            background-color: rgba(255,255,255,0.12);
                            color: #a7f3d0;
                            font-size: 24px;
                            font-weight: bold;
                            line-height: 52px;
                        ">
                            S
                        </div>

                        <h1 style="
                            margin: 0;
                            color: #ffffff;
                            font-size: 24px;
                            font-weight: 700;
                        ">
                            Account Created
                        </h1>

                        <p style="
                            margin: 8px 0 0;
                            color: #d1fae5;
                            font-size: 14px;
                        ">
                            Your account is ready to use
                        </p>

                    </div>


                    <!-- Content -->
                    <div style="
                        padding: 36px 30px;
                        text-align: center;
                    ">

                        <h2 style="
                            margin: 0 0 10px;
                            color: #0f172a;
                            font-size: 22px;
                        ">
                            Your Login Password
                        </h2>

                        <p style="
                            margin: 0 auto;
                            max-width: 400px;
                            color: #64748b;
                            font-size: 15px;
                            line-height: 24px;
                        ">
                            Your account has been successfully created.
                            Use the password below to log in to your account.
                        </p>


                        <!-- Password -->
                        <div style="
                            margin: 30px auto;
                            padding: 20px;
                            max-width: 340px;
                            background-color: #ecfdf5;
                            border: 1px solid #a7f3d0;
                            border-radius: 16px;
                        ">

                            <p style="
                                margin: 0 0 10px;
                                color: #047857;
                                font-size: 12px;
                                font-weight: bold;
                                text-transform: uppercase;
                                letter-spacing: 2px;
                            ">
                                Your Password
                            </p>

                            <div style="
                                color: #064e3b;
                                font-size: 24px;
                                font-weight: 700;
                                letter-spacing: 2px;
                                word-break: break-all;
                            ">
                                ${password}
                            </div>

                        </div>


                        <div style="
                            margin: 0 auto;
                            max-width: 400px;
                            padding: 14px 18px;
                            background-color: #f0fdf4;
                            border-radius: 10px;
                        ">

                            <p style="
                                margin: 0;
                                color: #166534;
                                font-size: 13px;
                                line-height: 20px;
                            ">
                                For your security, please change this password
                                after logging in.
                            </p>

                        </div>

                    </div>


                    <!-- Footer -->
                    <div style="
                        padding: 20px 30px;
                        background-color: #f8fafc;
                        border-top: 1px solid #e2e8f0;
                        text-align: center;
                    ">

                        <p style="
                            margin: 0;
                            color: #94a3b8;
                            font-size: 12px;
                            line-height: 18px;
                        ">
                            Please do not share your password with anyone.
                        </p>

                        <p style="
                            margin: 8px 0 0;
                            color: #64748b;
                            font-size: 12px;
                        ">
                            © ${new Date().getFullYear()} Your Application
                        </p>

                    </div>

                </div>

            </div>
        `,
        });
        return result
    }
    catch (error) {
        console.log(error)
    }

};