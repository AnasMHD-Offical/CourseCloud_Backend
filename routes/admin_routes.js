//Importing Es modules
import express from "express"
import { add_category, add_sub_category, admin_login, delete_category, delete_sub_category, edit_category, edit_sub_category, get_all_categories, listing_category, listing_sub_category, reset_password, send_otp, validate_otp } from "../controller/admin_controller.js"
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

//Route for edit category
admin_route.put("/edit_category",edit_category)

//Route for delete category 
admin_route.patch("/delete_category",delete_category)

//Route listing sub category
admin_route.patch("/listing_category",listing_category)

//Route for admin add sub category
admin_route.put("/add_sub_category",add_sub_category)

//Route for admin edit sub category
admin_route.put("/edit_sub_category",edit_sub_category)

//Route for admin delete sub category
admin_route.put("/delete_sub_category",delete_sub_category)

//Route for listing sub category
admin_route.put("/listing_sub_category",listing_sub_category)

//exporting admin_route module
export default admin_route