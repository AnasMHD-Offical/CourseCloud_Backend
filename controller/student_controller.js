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
const student_login = async (req, res) => {
    try {
        const { email, password } = req.body
        //checking the user exist or not
        const response = await student_model.findOne({ email })
        const db_password = response?.password
        const is_blocked = response?.is_blocked
        console.log("password", db_password);

        console.log(response);

        if (response) {
            //comparing the passwordsame or not 
            const is_password_same = await compare_password(password, db_password)
            //if password is same the proceed to next
            if (is_password_same) {
                //if the user was blocked by the admin we will send a rejected response with 403 forbidden access
                if (!is_blocked) {
                    const student_data = {
                        _id: response?._id,
                        email: response?.email,
                        role: "student" // based on the user role it will change
                    }
                    //creating access_token and refresh_token based on user role and data 
                    const access_token = generate_access_token("student", student_data)
                    const refresh_token = generate_refresh_token("student", student_data)
                    console.log(access_token, refresh_token);
                    //creating a refresh_token_model based on the credentials
                    const new_refresh_token = new refresh_token_model({
                        token: refresh_token,
                        user: student_data?.role,
                        user_id: student_data?._id,
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) //approximately 7 days
                    })
                    //saving the model to db
                    const saved_token = await new_refresh_token.save()
                    if (saved_token) {
                        // store_token("student_access_token", access_token, 15 * 60 * 1000, res)

                        //storing the refresh_token to the cookie 
                        store_token("student_refresh_token", refresh_token, 24 * 60 * 60 * 1000, res)
                        //sending  resolved response with 200 status
                        res.status(200)
                            .json({
                                message: "Student login successfully", success: true, student_data: {
                                    ...student_data,
                                    name: response?.name
                                },
                                access_token,
                                role:"student"
                            })
                    }
                } else {
                    res.status(403)
                        .json({ message: "Access denied. Student was blocked", success: false })
                }
            } else {
                res.status(403)
                    .json({ message: "Invalid email or password" , success: false})
            }
        } else {
            res.status(403)
                .json({ message: "Student not exist . Try another email or Create an account", success: false })
        }
    } catch (error) {
        console.log(error);

        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error })
    }
}
//controller to handle student Register.
const student_register = async (req, res) => {
    try {
        //Destructuring student details from client request
        const { name, mobile, email, dob, password } = req.body
        //Checking if the user exists
        const is_user_exist = await student_model.findOne({ email })
        //Chechinking is the user is already exist
        if (is_user_exist) {
            return res.status(409)
                .json({ message: "Student already exist. Try another email or Login to your account", success: false })
        }
        //hashing the entered password using an external function
        const hashed_password = await hash_password(password)
        //creating new student 
        const new_student = new student_model({ name, email, password: hashed_password, dob, mobile })
        //save student deatils to database
        const student_saved = await new_student.save()

        if (student_saved) {
            //providing a resolved response
            return res.status(200)
                .json({ message: "Student registered successfully", success: true, student_data: { _id: new_student._id, name: new_student.name, joined_on: new_student.created_at } })
        }

    } catch (error) {
        //Previding the reject response
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
        const is_student_exist = await student_model.findOne({ email: email })
        console.log(is_student_exist);
        const student_name = is_student_exist?.name

        //if the user doesn't exist then genearate otp and save it to the db
        if (!is_student_exist && For === "registration" || is_student_exist && For === "forgot_password") {
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
                name: name || student_name,
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
                .json({ message: "User Already exist. Try another email or Login to your account", success: false })
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
        const is_otp_found = await otp_model.find({ email , For }).sort({ created_at: -1 }).limit(1)
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
        const Student_data = await student_model.findOne({ email })
        if (Student_data) {
            const hashed_password = await hash_password(password)
            Student_data.password = hashed_password
            await Student_data.save()
            res.status(200)
                .json({ message: "Password reset successfully", success: true, data: { _id: Student_data._id, name: Student_data.name } })
        } else {
            res.status(403)
                .json({ message: "Student not Exist. Try to register your account", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong", success: false, error })
    }
}
//controller to handle the create new access token with refresh token when the access token exprires.  
const refresh_token = async (req, res) => {
    try {
        //getting the refresh_token from the cookie
        const refresh_token = req?.cookies?.student_refresh_token
        console.log(refresh_token);
        //if cookie not found send a rejected response with status 401
        if (!refresh_token) {
            return res.status(401)
                .json({ message: "Refresh token not found", success: false })
        }
        const is_refresh_token_found = await refresh_token_model.findOne({ token: refresh_token })
        //based on the role provided in the refresh_token_model the access_secret and refresh_secret will change accordingly
        let refresh_secret
        let access_secret
        //chehcing access token and setting secrets based on the role 
        if (is_refresh_token_found.user === "student") {

            refresh_secret = process.env.JWT_STUDENT_REFRESH_TOKEN_SECRET
            access_secret = process.env.JWT_STUDENT_ACCESS_TOKEN_SECRET
            console.log("rf:", refresh_secret, "AC:", access_secret);

        } else if (is_refresh_token_found.user === "instructor") {

            refresh_secret = process.env.JWT_INSTRUCTOR_REFRESH_TOKEN_SECRET
            access_secret = process.env.JWT_INSTRUCTOR_ACCESS_TOKEN_SECRET
            console.log("rf:", refresh_secret, "AC:", access_secret);

        } else if (is_refresh_token_found.user === "admin") {

            refresh_secret = process.env.JWT_ADMIN_REFRESH_TOKEN_SECRET
            access_secret = process.env.JWT_ADMIN_ACCESS_TOKEN_SECRET
            console.log("rf:", refresh_secret, "AC:", access_secret);

        }
        console.log(is_refresh_token_found, is_refresh_token_found?.user);
        //Checking the token is get from the db
        if (is_refresh_token_found) {
            //Ckecking if the refresh token was expired or not
            if (is_refresh_token_found.expiresAt > new Date()) {
                //decoding is the refresh token is valid or not
                const decode = jwt.verify(refresh_token, refresh_secret)
                if (decode) {
                    //creating a new access_token based on the refresh token
                    const new_access_token = jwt.sign(
                        { _id: decode._id, email: decode.email },
                        access_secret,
                        { expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES }
                    )
                    console.log("access_token :", new_access_token);
                    //sending a resolved response with status 200
                    res.status(200)
                        .json({ message: "Access Token created successfully", success: true, access_token: new_access_token,role:is_refresh_token_found?.user })
                } else {
                    res.status(403)
                        .json({ message: "invalid refresh token", success: false })
                }
            } else {
                //if token expired then token will removed from the db
                await refresh_token_model.deleteOne({ token: refresh_token })
                res.status(403)
                    .json({ message: "Refresh token expired . Login to your account", success: false })
            }

        } else {
            //if token was not found in the db sent a rejected response with status 403
            res.status(403)
                .json({ message: "invalid refresh token", success: false })
        }

    } catch (error) {
        console.log(error);
        //sending rejected response for every error with status 500
        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error })

    }
}
//exporting student controllers
export {
    student_login,
    student_register,
    send_otp,
    validate_otp,
    refresh_token,
    reset_password
}