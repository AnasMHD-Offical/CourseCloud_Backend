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
import category_model from "../models/category.js"


// <-------------- Admin Auth -------------------->

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

// <--------------- Admin Category management --------------->

//Controller for handle add category
const add_category = async (req, res) => {
    try {

        const { title, description } = req.body
        //Finding the category alreary exist or not
        const categories = await category_model.find({ title })
        //Checking the category is not exist (presized finding)
        const is_category_exist = categories.filter((category) => (category.title.toLowerCase().trim() === title.toLowerCase().trim()))
        //if category is not exist then go to further proceduers
        if (is_category_exist.length === 0) {
            //creating a new category
            const new_category = new category_model({
                title: title,
                description: description
            })
            //save the category into db 
            const category_saved = await new_category.save()
            if (category_saved) {
                //if the category saved successfully then send a resolved response with statuscode 200
                res.status(200)
                    .json({ message: "Category added successfully", success: true, category: category_saved })
            } else {
                // if any error occurs in database to saving the document throw an error to identify
                res.status(400)
                    .json({ message: "Unexpected error occuurs. Modal schema not matching.", success: false })
            }
        // if the user exist then throw a rejected resposne with status 409
        } else {
            res.status(409)
                .json({ message: "Category is already exist. Try another one", success: false })
        }
    //if the any other error occurs then throw a rejected resposne with status code 500
    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error })
    }
}
//Controller for handle get all category
const get_all_categories = async (req, res) => {
    try {
        //Getting all category that doesn't unlisted from the admin
        const get_category = await category_model.find({ status: true })
        // send and resolved response with statuscode 200 with the getted data
        if (get_category) {
            res.status(200)
                .json({ message: "Category fetched successfully", success: true, all_categories: get_category })
        }
    } catch (error) {
        //any other error occurs then send a rejected response with status 500
        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error })
    }
}
//Controller for handle add sub category
const add_sub_category = async (req, res) => {
    try {
        const { title, description } = req.body.data
        const _id = req.body.id
        console.log(_id);
        //get the category having the category_id
        const get_category = await category_model.findOne({ _id })
        // console.log(get_category);
        //getting the array of sub_category object 
        const sub_categories = get_category?.sub_category

        //Presizely cheking the sub category exist or not  
        const is_sub_category_exist = sub_categories.filter((sub) => (sub.title.toLowerCase().trim() === title.toLowerCase().trim()))
        console.log(is_sub_category_exist.length);

        //checking the category exist or not
        if (get_category) {
            // console.log(get_category);
            // tif the sub category not exist then go for furthur process
            if (is_sub_category_exist.length === 0) {
                // add the new sub category to the array by spread operator otherwise it will override the existing one
                get_category.sub_category = [...sub_categories, { title, description }]
                // The editing the sub category to the db
                const saved = await get_category.save()
                // if the saving was done then sent a resolved resposne with statuscode 200
                if (saved) {
                    res.status(200)
                        .json({ message: "Sub category added", success: true })
                } else {
                    //if there is any issue will occur while saving it into the db throw an error to identify it 
                    res.status(400)
                        .json({ message: "Unexpexted error founded", success: false })
                }
            } else {
                //if the sub category already exist then throw an rejected response with 409 statuscode
                res.status(409)
                    .json({ message: "Sub category already exist . Try another one", success: false })
            }
        } else {
            //if the category is didn't get from the datatbase then throw a rejected resposne with 404 not found
            res.status(404)
                .json({ message: "Invalid category . Try with a valid category", success: false })
        }

    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error })
    }
}

//Controller for handle edit category
const edit_category = async (req, res) => {
    try {
        const { title, description } = req.body.data
        const _id = req.body.id
        console.log(_id);

        let is_changed = false
         //get the category having the category_id
        const get_category = await category_model.findOne({ _id })
        //checking if the category founded or not
        if (get_category) {
            //checking if the sub category already exist or not 
            if (get_category.title.toLowerCase().trim() !== title.toLowerCase().trim()) is_changed = true
            if (get_category.description.toLowerCase().trim() !== description.toLowerCase().trim()) is_changed = true
            //ovirride the category with the new title and descriptions
            get_category.title = title
            get_category.description = description
            console.log(get_category);
            //save the updates to the db
            const edited = await get_category.save()
            console.log(edited);
            //if no edits are done in the with the data sent a resolved response with mentioning it with statuscode 200
            if (edited && !is_changed) {
                res.status(200)
                    .json({ message: "Category edited successfully. No changes made", success: true })
            } else if (edited && is_changed) {
                //if it edited with changes then sent a normal resolved response with status code 200
                res.status(200)
                    .json({ message: "Category edited successfully.", success: true })
                } else {
                //Any unexpected error happens during the db update throws an rejected resposne with 400 status code 
                res.status(400)
                    .json({ message: "Unexpected error found. Try again", success: false })
            }
        } else {
            // if the category was not found then throw a not fount recjected resposne 
            res.status(404)
                .json({ message: "Category not found .Try another one", success: false })
        }


    } catch (error) {
        res.status(200)
            .json({ message: "Something went wrong", success: false, error })
    }
}

//exporting student controllers
export {
    admin_login,
    send_otp,
    validate_otp,
    reset_password,
    add_category,
    get_all_categories,
    add_sub_category,
    edit_category
}