import student_model from "../models/student.js"
import course_model from "../models/course.js"
import otp_model from "../models/otp.js"
import { send_verification_mail } from "../utils/nodemailer/send_verification_mail.js"
import { generate_otp } from "../utils/otp_generator/otp_genarator.js"
import { hash_password, compare_password } from "../utils/password_manager.js"
import { generate_access_token, generate_refresh_token } from "../utils/JWT/generateTokens.js"
import { store_token } from "../utils/JWT/StoreCookie.js"
import jwt from "jsonwebtoken"
import refresh_token_model from "../models/refresh_token.js"
import validator from "validator"
import lesson_model from "../models/lesson.js"
import category_model from "../models/category.js"
import cart_model from "../models/cart.js"
import mongoose from "mongoose"
import wishlist_model from "../models/wishlist.js"
const ObjectId = mongoose.Types.ObjectId

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
                                role: "student"
                            })
                    }
                } else {
                    res.status(403)
                        .json({ message: "Access denied. Student was blocked", success: false })
                }
            } else {
                res.status(403)
                    .json({ message: "Invalid email or password", success: false })
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
            console.log("hello world here");

            if (!is_student_exist || !is_student_exist.is_blocked) {
                console.log("hello world here");
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
            } else {
                res.status(403)
                    .json({ message: "Access denied. Student was blocked.", success: false })
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
        // const role_refresh_token = `${req.role}_refresh_token`
        //getting the refresh_token from the cookie
        const refresh_token = req?.cookies?.student_refresh_token || req?.cookies?.admin_refresh_token || req?.cookies?.instructor_refresh_token
        console.log(refresh_token);
        //if cookie not found send a rejected response with status 401
        if (!refresh_token) {
            return res.status(403)
                .json({ message: "Refresh token expired . Login to your account", success: false })
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
                        .json({ message: "Access Token created successfully", success: true, access_token: new_access_token, role: is_refresh_token_found?.user })
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

const student_logout = async (req, res) => {
    try {
        //getting refresh token from cookie
        const student_refresh_token = req.cookies["student_refresh_token"]
        console.log(student_refresh_token);
        // Removing the refresh token from db
        const removedRefresh_token = await refresh_token_model.deleteOne({ token: student_refresh_token })
        if (removedRefresh_token) {
            // Removing the refresh token from cookie
            res.cookie("student_refresh_token", "", {
                httpOnly: true,
                expires: new Date(0),
            });
            // Removing the access token from cookie
            res.cookie("student_access_token", "", {
                httpOnly: true,
                expires: new Date(0),
            });
            //if all workes well the proceed with resolved response with status 200
            res.status(200)
                .json({ message: "Student Logout Successfully", success: true })
        } else {
            //if any error happended with the delete in db throw an error
            res.status(400)
                .json({ message: "Unexpected error occurs. Try again", success: false })
        }
    } catch (error) {
        // if any other will found thnrow an rejected response with 500 status code and the error.
        res.status(500)
            .json({ message: "Something went wrong", success: false, error })
    }

}

//Controller for handle getting the courses 
const get_courses = async (req, res) => {
    try {
        const get_course = await course_model.find({ is_blocked: false }).sort({ createdAt: -1 })
        // console.log(get_course);

        if (get_course) {
            res.status(200)
                .json({ message: "Courses fetched successfully", success: true, courses: get_course })
        } else {
            res.status(404)
                .json({ message: "Courses not found", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong", success: false, error })
    }
}

//Controller for handle getting a course by its _id
const get_course = async (req, res) => {
    try {
        const _id = req.params.id

        const get_course = await course_model.findOne({ _id }).populate("category").populate("instructor_id").populate("lessons")
        // const lessons = await course_model.findOne({ _id })
        // console.log(lessons);
        // console.log(get_course.category.title);
        if (get_course) {
            res.status(200)
                .json({ message: "Course fetched successfully", success: true, course: get_course })
        } else {
            res.status(404)
                .json({ message: "Course not found", success: false })
        }


    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error.message })
        console.log(error);

    }
}

//Controller for handling getting courses by category
const get_courses_by_category = async (req, res) => {
    try {
        const { id, subcategory } = req.params
        // console.log(id, subcategory);

        const get_courses_by_category = await course_model.find({ category: id }).populate("category").populate("instructor_id").populate("lessons")
        if (get_courses_by_category) {

            if (subcategory) {
                const get_courses_by_subcategory = await course_model.find({ subCategory: subcategory }).populate("category").populate("instructor_id").populate("lessons")
                if (get_courses_by_subcategory) {
                    res.status(200)
                        .json({ message: "Courses find by Subcategory & category fetched successfully", success: true, BySubcategory: get_courses_by_subcategory, ByCategory: get_courses_by_category })
                }
            } else {
                res.status(200)
                    .json({ message: "Courses find by category fetched successfully", success: true, ByCategory: get_courses_by_category })
            }
        } else {
            res.status(404)
                .json({ message: "No courses found by the category", success: false })
        }

    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error.message })
    }
}



//Controller to get Cart by User id
const get_cart = async (req, res) => {
    try {
        const _id = req.params.id
        console.log(_id);

        const get_cart = await cart_model.findOne({ student_id: _id }).populate({ path: "cart_items.course_id", populate: "instructor_id" })
        console.log(get_cart);

        if (get_cart) {
            res.status(200)
                .json({ message: "Cart items fetched successfully", success: true, cart_items: get_cart })
        } else {
            res.status(404)
                .json({ message: "No items found in the cart", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error.message })
    }
}

//Controller to add an item to the cart
const add_to_cart = async (req, res) => {
    try {
        const { course_id, student_id, price } = req.body
        const get_cart = await cart_model.findOne({ student_id: student_id })
        console.log("cart Found :", get_cart);

        const is_course_exist = await cart_model.findOne({ student_id: student_id, "cart_items.course_id": course_id })
        console.log("course existed :", is_course_exist);

        if (get_cart) {
            if (!is_course_exist) {
                get_cart.cart_items = [...get_cart.cart_items, {course_id: course_id, price: price?.$numberDecimal}]
                const saved = await get_cart.save()
                if (saved) {
                    res.status(200)
                        .json({ message: "Course Added to Cart successfully", success: true })
                } else {
                    res.status(400)
                        .json({ message: "Unexpected error occurs. Try Again", success: false })
                }
            } else {
                res.status(409)
                    .json({ message: "Course already added to the cart", success: false })
            }
        } else {
            const new_cart = new cart_model({
                student_id: student_id,
                cart_items: {
                    course_id: course_id,
                    price: price
                }
            })
            const added = await new_cart.save()
            if (added) {
                res.status(200)
                    .json({ message: "Course Added to Cart successfully", success: true })
            } else {
                res.status(400)
                    .json({ message: "Unexpected error occurs. Try Again", success: false })
            }
        }


    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error.message })
        console.log(error.message);

    }
}

//Controller to remove items 
const remove_from_cart = async (req, res) => {
    try {
        const { student_id, course_id } = req.params

        const get_cart = await cart_model.findOne({ student_id })
        const { cart_items } = get_cart

        if (get_cart) {

            const filtered_cart_items = cart_items.filter((items) => {
                return !items._id.equals(new ObjectId(String(course_id)));
            })

            get_cart.cart_items = filtered_cart_items
            const deleted = await get_cart.save()
            if (deleted) {
                res.status(200)
                    .json({ message: "Item remove from cart successfully", success: true })
            }
        } else {
            res.status(404)
                .json({ message: "Cart not found", success: false })
        }
    } catch (error) {
        console.log(error);
        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error.message })
    }
}

const get_wishlist = async (req, res) => {
    try {
        const _id = req.params.id
        console.log(_id);

        const get_wishlist = await wishlist_model.findOne({ student_id: _id }).populate({ path: "wishlist_items", populate: "instructor_id" })
        console.log(get_wishlist);
        if (get_wishlist) {
            res.status(200)
                .json({ message: "Wishlist items fetched successfully", success: true, wishlist_items: get_wishlist })
        } else {
            res.status(404)
                .json({ message: "No items found in the wishlist", success: false })
        }
    } catch (error) {
        console.log(error);
        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error.message })
    }
}

const add_to_wishlist = async (req, res) => {
    try {
        const { course_id, student_id } = req.body
        console.log(student_id);

        const get_wishlist = await wishlist_model.findOne({ student_id: student_id })
        console.log("Wishlist Found :", get_wishlist);

        const is_course_exist = await wishlist_model.findOne({ student_id: student_id, wishlist_items: course_id })
        console.log("course existed :", is_course_exist);

        if (get_wishlist) {
            if (!is_course_exist) {
                get_wishlist.wishlist_items = [...get_wishlist.wishlist_items, course_id]
                const saved = await get_wishlist.save()
                if (saved) {
                    res.status(200)
                        .json({ message: "Course Added to wishlist successfully", success: true })
                } else {
                    res.status(400)
                        .json({ message: "Unexpected error occurs. Try Again", success: false })
                }
            } else {
                res.status(409)
                    .json({ message: "Course already added to the wishlist", success: false })
            }
        } else {
            const new_wishlist = new wishlist_model({
                student_id: student_id,
                wishlist_items: course_id,
            })
            const added = await new_wishlist.save()
            if (added) {
                res.status(200)
                    .json({ message: "Course Added to wishlist successfully", success: true })
            } else {
                res.status(400)
                    .json({ message: "Unexpected error occurs. Try Again", success: false })
            }
        }
    } catch (error) {
        console.log(error);
        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error.message })
    }
}

const remove_from_wishlist = async (req, res) => {
    try {
        const { student_id, course_id } = req.params

        const get_wishlist = await wishlist_model.findOne({ student_id })
        const { wishlist_items } = get_wishlist

        if (get_wishlist) {

            const filtered_wishlist_items = wishlist_items.filter((items) => {
                return !items.equals(new ObjectId(String(course_id)));
            })

            get_wishlist.wishlist_items = filtered_wishlist_items
            const deleted = await get_wishlist.save()
            if (deleted) {
                res.status(200)
                    .json({ message: "Item remove from Wishlist successfully", success: true })
            }
        } else {
            res.status(404)
                .json({ message: "Wishlist not found", success: false })
        }
    } catch (error) {
        console.log(error);
        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error.message })
    }
}

const get_student_data = async (req, res) => {
    try {
        const _id = req.params.id
        console.log(_id);

        const get_student = await student_model.findOne({ _id })
        console.log(get_student);
        if (get_student) {
            console.log("Hello");

            res.status(200)
                .json({ message: "Student data fetched successfully.", success: true, student_data: get_student })
        } else {
            res.status(404)
                .json({ message: "Student is not exist . try another one", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error.message })
    }
}

const edit_profile = async (req, res) => {
    const { name, email, mobile, dob, current_password, new_password, profile, _id, proffession, about } = req.body
    console.log(req.body);

    try {
        let isChanged = false
        const get_student = await student_model.findOne({ _id })
        if (get_student) {
            if (name !== get_student.name && name !== "") {
                get_student.name = name
                isChanged = true
            }
            if (email !== get_student.email && email !== "") {
                get_student.email = email
                isChanged = true
            }
            if (mobile !== get_student.mobile && mobile !== "") {
                get_student.mobile = mobile
                isChanged = true
            }
            if (dob !== get_student?.dob && dob !== "") {
                get_student.dob = dob
                isChanged = true
            }
            if (current_password !== "" && new_password !== "") {
                const is_password_same = await compare_password(current_password, get_student?.password)
                if (is_password_same || !get_student?.googleId) {
                    if (new_password !== current_password || new_password !== "") {
                        get_student.password = new_password
                        isChanged = true
                    }
                } else if (get_student?.googleId) {
                    if (new_password !== "") {
                        get_student.password = new_password
                        isChanged = true
                    }
                } else {
                    res.status(400)
                        .json({ message: "Current password is wrong . Try to enter a valid password", success: false })
                }
            }
            if (profile !== get_student?.profile && profile !== "") {
                get_student.profile = profile
                isChanged = true
            }
            if (proffession !== get_student?.proffession && proffession !== "") {
                get_student.proffession = proffession
                isChanged = true
            }
            if (about !== get_student?.about && about !== "") {
                get_student.about = about
                isChanged = true
            }

            const isUpdated = await get_student.save()
            if (isUpdated && !isChanged) {
                res.status(200)
                    .json({ message: "Student updated successfully. No changes made", success: true })
            } else {
                res.status(200)
                    .json({ message: "Student updated successfully.", success: true })
            }

        } else {
            res.status(404)
                .json({ message: "Student not found", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error })
    }
}





//exporting student controllers
export {
    // Students Auth 
    student_login,
    student_register,
    send_otp,
    validate_otp,
    refresh_token,
    reset_password,
    student_logout,
    // Students Landing and Home page
    get_courses,
    get_course,
    get_courses_by_category,
    //Cart
    get_cart,
    add_to_cart,
    remove_from_cart,
    //Wishlist
    get_wishlist,
    add_to_wishlist,
    remove_from_wishlist,
    //Profile
    get_student_data,
    edit_profile
}