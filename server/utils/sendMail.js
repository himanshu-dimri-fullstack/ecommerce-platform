import nodemailer from "nodemailer"
import dotenv from "dotenv"

dotenv.config()


const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
})

export const sendMail = async (email, otp) => {
    await transport.sendMail({
        from: process.env.SMTP_USER,
        to: email,
        subject: "Your Password Reset OTP",
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
                            Password Reset
                        </h1>

                        <p style="
                            margin: 8px 0 0;
                            color: #d1fae5;
                            font-size: 14px;
                        ">
                            Secure account verification
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
                            Verify Your Email
                        </h2>

                        <p style="
                            margin: 0 auto;
                            max-width: 400px;
                            color: #64748b;
                            font-size: 15px;
                            line-height: 24px;
                        ">
                            We received a request to reset your password.
                            Use the verification code below to continue.
                        </p>


                        <!-- OTP -->
                        <div style="
                            margin: 30px auto;
                            padding: 20px;
                            max-width: 280px;
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
                                Your OTP
                            </p>

                            <div style="
                                color: #064e3b;
                                font-size: 34px;
                                font-weight: 700;
                                letter-spacing: 10px;
                            ">
                                ${otp}
                            </div>

                        </div>


                        <p style="
                            margin: 0;
                            color: #94a3b8;
                            font-size: 13px;
                            line-height: 20px;
                        ">
                            This OTP is valid for a limited time.
                            Do not share this code with anyone.
                        </p>

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
                        ">
                            If you didn't request this, you can safely
                            ignore this email.
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
        `
    })
}
