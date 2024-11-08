import { OAuth2Client } from "google-auth-library"
import { generate_refresh_token, generate_access_token } from "../utils/JWT/generateTokens.js"
import refresh_token_model from "../models/refresh_token.js"
import student_model from "../models/student.js"
import instructor_model from "../models/instuctor.js"
import { store_token } from "../utils/JWT/StoreCookie.js"

const client = new OAuth2Client()

export const googleAuth = async (req, res) => {
    try {
        const { email, sub, name, picture } = req.body.data
        const role = req.body.role
        // console.log(req.body);
        console.log("Here", req.body);
        const google_id = sub

        let student = await student_model.findOne({ email })
        let instructor = await instructor_model.findOne({ email })

        if (role === "student") {
            if (!student) {
                console.log("Here we go");

                const new_student = await student_model.create({
                    googleId: google_id,
                    email: email,
                    name: name,
                    profile: picture
                })
                const student_data = {
                    _id: new_student._id,
                    email: new_student.email,
                    role: "student"
                }
                const access_token = generate_access_token("student", student_data)
                const refresh_token = generate_refresh_token("student", student_data)

                const new_refresh_token = new refresh_token_model({
                    token: refresh_token,
                    user: "student",
                    user_id: new_student._id,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                })
                await new_refresh_token.save()
                store_token("student_refresh_token", refresh_token, 24 * 60 * 60 * 1000, res)

                res.status(200)
                    .json({
                        message: "google student register and login successfully",
                        success: true,
                        user_data: {
                            _id: new_student._id,
                            email: new_student.email,
                            name: new_student.name,
                            role: "student"
                        },
                        access_token,
                        role: "student"
                    })
            } else {
                if (!student.is_blocked) {
                    const student_data = {
                        _id: student._id,
                        email: student.email,
                        role: "student"
                    }
                    const access_token = generate_access_token("student", student_data)
                    const refresh_token = generate_refresh_token("student", student_data)

                    const new_refresh_token = new refresh_token_model({
                        token: refresh_token,
                        user: "student",
                        user_id: student._id,
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                    })
                    await new_refresh_token.save()
                    store_token("student_refresh_token", refresh_token, 24 * 60 * 60 * 1000, res)
                    res.status(200)
                        .json({
                            message: "Google login succesfully",
                            success: true,
                            user_data: {
                                _id: student._id,
                                email: student.email,
                                name: student.name,
                                role: "student"
                            },
                            access_token,
                            role: "student"
                        })
                    // store_token("student_refresh_token", refresh_token, 24 * 60 * 60 * 1000, res)
                } else {
                    res.status(403)
                        .json({ success: false, message: "Access denied. Student was blocked!" })
                }
            }
        } else if (role === "instructor") {
            if (!instructor) {
                console.log("here");

                const new_instructor = await instructor_model.create({
                    googleId: google_id,
                    email,
                    name,
                    profile: picture
                })

                const instructor_data = {
                    _id: new_instructor._id,
                    email: new_instructor.email,
                    role: "instructor"
                }
                const access_token = generate_access_token("instructor", instructor_data)
                const refresh_token = generate_refresh_token("instructor", instructor_data)

                const new_refresh_token = new refresh_token_model({
                    token: refresh_token,
                    user: "instructor",
                    user_id: new_instructor._id,
                    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                })
                await new_refresh_token.save()
                store_token("instructor_refresh_token", refresh_token, 24 * 60 * 60 * 1000, res)

                res.status(200)
                    .json({
                        message: "google instructor register and login successfully",
                        success: true,
                        user_data: {
                            _id: new_instructor._id,
                            email: new_instructor.email,
                            name: new_instructor.name,
                            role: "instructor"
                        },
                        access_token,
                        role: "instructor"
                    })
            } else {
                if (!instructor.is_blocked) {
                    const instructor_data = {
                        _id: instructor._id,
                        email: instructor.email,
                        role: "instructor"
                    }
                    const access_token = generate_access_token("instructor", instructor_data)
                    const refresh_token = generate_refresh_token("instructor", instructor_data)

                    const new_refresh_token = new refresh_token_model({
                        token: refresh_token,
                        user: "instructor",
                        user_id: instructor._id,
                        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
                    })
                    await new_refresh_token.save()
                    store_token("instructor_refresh_token", refresh_token, 24 * 60 * 60 * 1000, res)
                    res.status(200)
                        .json({
                            message: "Google login succesfully",
                            success: true,
                            user_data: {
                                _id: instructor._id,
                                email: instructor.email,
                                name: instructor.name,
                                role: "instructor"
                            },
                            access_token,
                            role: "instructor"
                        })
                    // store_token("student_refresh_token", refresh_token, 24 * 60 * 60 * 1000, res)
                } else {
                    res.status(403)
                        .json({ success: false, message: "Access denied. Instructor was blocked!" })
                }
            }
        }

    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error })
    }
} 