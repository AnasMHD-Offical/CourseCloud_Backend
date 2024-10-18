// Importing Es modules 
import express from "express"
import { student_login, student_register, send_otp, validate_otp, refresh_token, reset_password } from "../controller/student_controller.js"
const student_route = express.Router()

//Route for student login 
student_route.post("/student_login", student_login)

//Route for student register
student_route.post("/student_register", student_register)

//Route for sent otp
student_route.post("/send_otp", send_otp)

//Route for validate otp
student_route.post("/validate_otp", validate_otp)

//Route for reset password
student_route.put("/reset_password", reset_password)

//Route for refresh access token
student_route.post("/refresh_token", refresh_token)

// Exporting student_route module
export default student_route