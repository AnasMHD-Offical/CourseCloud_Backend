import nodemailer from "nodemailer"

//module for nodemailer configuration and setup
export const send_mail = async (email, subject, body) => {
    try {
        //nodemailer configuration
        const transporter = nodemailer.createTransport({
            //mail protocol setting
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for port 465, false for other ports
            auth: {
                //client credentials (developer)
                user: process.env.NODEMAILER_USER,
                pass: process.env.NODEMAILER_PASS,
            },
        });

        // send mail with defined transport object
        const info = await transporter.sendMail({
            from: 'CourseCloud - coursecloudofficial@gmail.com', // sender address
            to: email, // list of receivers
            subject: subject, // Subject line
            html: body, // html body
        });

        console.log("Message sent:", info.messageId);
        return info
    } catch (error) {
        console.log(error);
    }
}