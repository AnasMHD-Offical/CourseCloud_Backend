//Importing Es modules
import express from "express"
import { add_category, add_sub_category, admin_login, edit_category, get_all_categories, reset_password, send_otp, validate_otp } from "../controller/admin_controller.js"
const admin_route = express.Router()


// <<-------------- Admin Auth Route ----------------->>
//Route for admin login
admin_route.post("/admin_login", admin_login)

//Route for admin sent otp 
admin_route.post("/send_otp", send_otp)

//Route for validate otp
admin_route.post("/validate_otp", validate_otp)

//Route for admin reset password
admin_route.put("/reset_password", reset_password)

// <<-------------- Admin Category Management Route ------------------>>

//Route for admin add category 
admin_route.post("/add_category", add_category)

//Route for get admin get all category
admin_route.get("/get_all_categories", get_all_categories)

//Route for admin add category
admin_route.put("/add_sub_category",add_sub_category)

//Route for edit category
admin_route.put("/edit_category",edit_category)
//exporting admin_route module
export default admin_route