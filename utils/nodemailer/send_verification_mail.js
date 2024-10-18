import { send_mail } from "./nodemailer_config.js";

//module to sent otp verification mail derived from nodemailer config module.
export const send_verification_mail = async (email, otp, name, For) => {
    try {
        const main_response = await send_mail(
            email,
            `CourseCloud - ${For} OTP verification email`,
            `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9; border-radius: 10px;">
                <h2 style="color: #4caf50; text-align: center;">Welcome to CourseCloud LMS!</h2>
            
                <p style="font-size: 16px;">Dear ${name},</p>
            
                <p style="font-size: 16px; line-height: 1.6;">
                    We're excited to have you join <strong>CourseCloud LMS</strong>, your partner in personalized learning. To get started, please verify your email address using the one-time password (OTP) below. This step will ensure your account is secure and ready to go .
                </p>
            
                <div style="text-align: center; margin: 30px 0;">
                  <span style="font-size: 28px; font-weight: bold; background-color: #eef7ee; padding: 15px 20px; border-radius: 8px; color: #4caf50; display: inline-block;">${otp}</span>
                </div>
            
                <p style="font-size: 16px; line-height: 1.6;">
                  If you didn't request this email, please ignore it, or contact our support team at <a href="mailto:support@coursecloud.com" style="color: #4caf50;">support@coursecloud.com</a>, and we'll be happy to assist you.
                </p>
            
                <p style="font-size: 16px; line-height: 1.6;">
                  We can't wait to help you reach your learning goals with our innovative tools and courses. Welcome to a world of limitless learning possibilities with <strong>CourseCloud LMS</strong>!
                </p>
            
                <p style="font-size: 16px;">Best regards,<br/><strong>The CourseCloud Team</strong></p>
            
                <hr style="border: none; border-top: 1px solid #ccc;" />
            
                <p style="font-size: 12px; color: #777; text-align: center;">
                  This email was sent from a no-reply address. For support, please reach out to us at <a href="mailto:support@coursecloud.com" style="color: #4caf50;">support@coursecloud.com</a>.
                </p>
            </div>
            `
        )
    } catch (error) {
        console.log(error);
    }
}