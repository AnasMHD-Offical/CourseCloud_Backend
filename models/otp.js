//importing ES6 modules
import mongoose from "mongoose";
import { send_verification_mail } from "../utils/nodemailer/send_verification_mail.js";
//defining otp collection schema
const otp_schema = mongoose.Schema({
    otp: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    created_at: {
        type: Date,
        default: Date.now(),
        expires: 60 * 2,
    },
})
//send otp verification mail when otp is saved in db
otp_schema.pre("save", async function (next) {
    console.log("New document saved to the database");
    //send verification email when a document is added to db
    if (this.isNew) {
        await send_verification_mail(this.email, this.otp, this.name)
    }
    next()
})

const otp_model = mongoose.model("otp", otp_schema)

export default otp_model