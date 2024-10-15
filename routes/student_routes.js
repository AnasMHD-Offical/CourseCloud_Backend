// Importing Es modules 
import express from "express"
import { student_login, student_register ,send_otp, validate_otp} from "../controller/student_controller.js"
const student_route = express.Router()

//Route for student login 
student_route.post("/student_login", student_login)

//Route for student register
student_route.post("/student_register",student_register)

//Route for sent otp
student_route.post("/send_otp",send_otp)

//Route for validate otp
student_route.post("/validate_otp",validate_otp)

// Exporting student_route module
export default student_route