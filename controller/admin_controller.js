import student_model from "../models/student.js"
import otp_model from "../models/otp.js"
import { send_verification_mail } from "../utils/nodemailer/send_verification_mail.js"
import { generate_otp } from "../utils/otp_generator/otp_genarator.js"
import { hash_password, compare_password } from "../utils/password_manager.js"
import { generate_access_token, generate_refresh_token } from "../utils/JWT/generateTokens.js"
import { store_token } from "../utils/JWT/StoreCookie.js"
import jwt from "jsonwebtoken"
import refresh_token_model from "../models/refresh_token.js"
import validator from "validator"

//Controller to handle student login 
const admin_login = async (req, res) => {
    try {
        const { email, password } = req.body
        //checking the user exist or not
        const response = await student_model.findOne({ email })
        const db_password = response?.password
        const is_admin = response?.is_admin
        console.log("password", db_password);

        console.log(response);

        if (response) {
            //comparing the passwordsame or not 
            const is_password_same = await compare_password(password, db_password)
            //if password is same the proceed to next
            if (is_password_same) {
                //if the user was blocked by the admin we will send a rejected response with 403 forbidden access
                if (is_admin) {
                    const admin_data = {
                        _id: response?._id,
                        email: response?.email,
                        role: "admin" // based on the user role it will change
                    }
                    //creating access_token and refresh_token based on user role and data 
                    const access_token = generate_access_token("admin", admin_data)
                    const refresh_token = generate_refresh_token("admin", admin_data)
                    console.log(access_token, refresh_token);
                    //creating a refresh_token_model based on the credentials
                    const new_refresh_token = new refresh_token_model({
                        token: refresh_token,
                        user: admin_data?.role,
                        user_id: admin_data?._id,
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) //approximately 7 days
                    })
                    //saving the model to db
                    const saved_token = await new_refresh_token.save()
                    if (saved_token) {
                        // store_token("admin_access_token", access_token, 15 * 60 * 1000, res)

                        //storing the refresh_token to the cookie 
                        store_token("admin_refresh_token", refresh_token, 24 * 60 * 60 * 1000, res)
                        //sending  resolved response with 200 status
                        res.status(200)
                            .json({
                                message: "Admin login successfully", success: true, admin_data: {
                                    ...admin_data,
                                    name: response?.name
                                },
                                access_token,
                                role: "admin"
                            })
                    }
                } else {
                    res.status(403)
                        .json({ message: "Access denied. Admin Only Access", success: false })
                }
            } else {
                res.status(403)
                    .json({ message: "Invalid email or password", success: false })
            }
        } else {
            res.status(403)
                .json({ message: "Admin not exist . Try another email ", success: false })
        }
    } catch (error) {
        console.log(error);

        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error })
    }
}
//Controller to handle sending otp to the registering user to verify
const send_otp = async (req, res) => {
    try {
        //Destructuring the email and name from the sent_otp client request
        const { email, name, For } = req.body
        console.log(req.body);

        // validating the email is on proper structure
        // const checking_validation = validator.isEmail(email)
        // if (!checking_validation) {
        //     return res.status(400)
        //         .json({ message: "Invalid email address", success: false })
        // }
        console.log("here we go");

        // search for the user in the database
        const is_admin_exist = await student_model.findOne({ email: email, is_admin: true })
        console.log(is_admin_exist);
        const admin_name = is_admin_exist?.name

        //if the user doesn't exist then genearate otp and save it to the db
        if (!is_admin_exist && For === "registration" || is_admin_exist && For === "forgot_password") {
            //calling function to generate otp
            let otp = await generate_otp()
            //checking is the otp is already on the database then the otp changes whenever the unique value found
            let is_otp_exist = await otp_model.findOne({ otp })
            while (is_otp_exist) {
                otp = await generate_otp()
                is_otp_exist = await otp_model.findOne({ otp })
            }
            //create a document of otp with user credentials and otp in db
            const new_otp = await otp_model.create({
                otp: otp,
                email: email,
                name: name || admin_name,
                For: For,
            })
            console.log(new_otp);

            //After the document creation in db . sending a resolved response to the client side
            if (new_otp) {
                return res.status(200)
                    .json({ message: "OTP sent successfully to the given email", success: true })
            }
            //if the user is already exist in the db . sending a reject response to the client side.
        } else {
            res.status(409)
                .json({ message: "Admin Already exist. Login to your account", success: false })
        }
    } catch (error) {
        //sending rejected response when any other errors are thrown.
        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error })
    }
}
//Controller to handle otp validation 
const validate_otp = async (req, res) => {
    try {
        //Destructuring the email and otp from the client side request
        const { email, otp, For } = req.body

        //checking the the otp that sended before and getting the latest sended otp
        const is_otp_found = await otp_model.find({ email, For }).sort({ created_at: -1 }).limit(1)
        console.log(is_otp_found);

        //checking is there is any otp is in the collection
        if (is_otp_found.length != 0) {
            //checking is the sended otp and clent entered otp is same 
            if (otp === is_otp_found[0]?.otp) {
                //sending the resolve response corressponding to the validation otp success
                res.status(200)
                    .json({ message: "OTP verified successfully", success: true, data: { email: email || "" } })
            } else {
                //sending the rejected response corresponding to the validation of otp failed
                res.status(400)
                    .json({ message: "Invalid OTP", success: false })
            }
        } else {
            //sending the rejected response corresponding to when the otp is expired after default time
            res.status(404)
                .json({ message: "OTP expired", success: false })
        }

    } catch (error) {
        //sending reject response corresponding with any other erros.
        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error })
    }
}
//Controller to handle reset password 
const reset_password = async (req, res) => {
    try {
        const { email, password } = req.body
        const Admin_data = await student_model.findOne({ email, is_admin: true })
        if (Admin_data) {
            const hashed_password = await hash_password(password)
            Admin_data.password = hashed_password
            await Admin_data.save()
            res.status(200)
                .json({ message: "Password reset successfully", success: true, data: { _id: Admin_data._id, name: Admin_data.name } })
        } else {
            res.status(403)
                .json({ message: "Unauthorized Access. Admin only access", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong", success: false, error })
    }
}
//controller to handle the create new access token with refresh token when the access token exprires.  

//exporting student controllers
export {
    admin_login,
    send_otp,
    validate_otp,
    reset_password
}