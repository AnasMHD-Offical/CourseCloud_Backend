import student_model from "../models/student.js"
import otp_model from "../models/otp.js"
import { send_verification_mail } from "../utils/nodemailer/send_verification_mail.js"
import { generate_otp } from "../utils/otp_generator/otp_genarator.js"
import { hash_password, compare_password } from "../utils/password_manager.js"
import validator from "validator"

//Controller to handle student login 
const student_login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (email && password) {
            res.status(200)
                .json({ message: "Student login successfully", success: true })
        } else {
            res.status(500)
                .json({ message: "Something went wrong", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong", success: false })
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
        const { email, name } = req.body
        //validating the email is on proper structure
        if (!validator.isEmail(email)) {
            res.status(400)
                .json({ message: "Invalid email address", success: false })
        }
        //search for the user in the database
        const is_student_exist = await student_model.findOne({ email })
        //if the user doesn't exist then genearate otp and save it to the db
        if (!is_student_exist) {
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
                name: name
            })
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
            .json({ message: "Something went wrong", success: true, error: error })
    }
}
//Controller to handle otp validation 
const validate_otp = async (req, res) => {
    try {
        //Destructuring the email and otp from the client side request
        const { email, otp } = req.body
        //checking the the otp that sended before and getting the latest sended otp
        const is_otp_found = await otp_model.find({ email }).sort({ created_at: -1 }).limit(1)
        //checking is there is any otp is in the collection
        if (is_otp_found.length != 0) {
            //checking is the sended otp and clent entered otp is same 
            if (otp === is_otp_found[0]?.otp) {
                //sending the resolve response corressponding to the validation otp success
                res.status(200)
                    .json({ message: "OTP verified successfully", success: true })
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
//exporting student controllers
export {
    student_login,
    student_register,
    send_otp,
    validate_otp
}