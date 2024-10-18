//Importing Es modules
import express from "express"
import { admin_login, reset_password, send_otp, validate_otp } from "../controller/admin_controller.js"
const admin_route = express.Router()

//Route for admin login
admin_route.post("/admin_login", admin_login)

//Route for admin sent otp 
admin_route.post("/send_otp", send_otp)

//Route for validate otp
admin_route.post("/validate_otp", validate_otp)

//Route for admin reset password
admin_route.put("/reset_password", reset_password)

//exporting admin_route module
export default admin_route