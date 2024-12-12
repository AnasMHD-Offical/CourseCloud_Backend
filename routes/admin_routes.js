//Importing Es modules
import express from "express"
import { add_category, add_sub_category, admin_login, admin_logout, block_course, block_instructor, block_student, delete_category, delete_sub_category, edit_admin, edit_category, edit_sub_category, get_admin_data, get_all_categories, get_all_courses, get_all_instructors, get_all_students, get_course_search_sort_filter, listing_category, listing_sub_category, reset_password, send_otp, unblock_course, unblock_instructor, unblock_student, validate_otp } from "../controller/admin_controller.js"
import { admin_auth } from "../middlewares/Auth.js"
import { get_courses_length } from "../controller/category_controller.js"
import { get_enrollment_analytics, get_platform_analytics_data, get_platform_revenueProfit_stats } from "../controller/dashboard_controller.js"
import { block_reviews, get_reviews, unblock_reviews } from "../controller/review_controller.js"
import { download_sales_report_excel, download_sales_report_pdf, get_sales_report } from "../controller/sales_controller.js"
const admin_route = express.Router()


//* <<-------------- Admin Auth Route ----------------->>
//Route for admin login
admin_route.post("/admin_login", admin_login)

//Route for admin sent otp 
admin_route.post("/send_otp", send_otp)

//Route for validate otp
admin_route.post("/validate_otp", validate_otp)

//Route for admin reset password
admin_route.put("/reset_password", reset_password)

//Route for admin logout 
admin_route.post("/admin_logout", admin_logout)

//* <<<<-------------- Admin Profile Management -------------------->>>>

//Route for get admin data based on the admin _id
admin_route.get("/get_admin_data/:id", admin_auth, get_admin_data)

//Route for edit admin data 
admin_route.patch("/edit_admin", admin_auth, edit_admin)

//* <<-------------- Admin Category Management Route ------------------>>

//Route for admin add category 
admin_route.post("/add_category", admin_auth, add_category)

//Route for get admin get all category
admin_route.get("/get_all_categories", admin_auth, get_all_categories)

//Route for edit category
admin_route.put("/edit_category", admin_auth, edit_category)

//Route for delete category 
admin_route.patch("/delete_category", admin_auth, delete_category)

//Route listing sub category
admin_route.patch("/listing_category", admin_auth, listing_category)

//Route for admin add sub category
admin_route.put("/add_sub_category", admin_auth, add_sub_category)

//Route for admin edit sub category
admin_route.put("/edit_sub_category", admin_auth, edit_sub_category)

//Route for admin delete sub category
admin_route.put("/delete_sub_category", admin_auth, delete_sub_category)

//Route for listing sub category
admin_route.put("/listing_sub_category", admin_auth, listing_sub_category)


//* <<<-------------------- Admin Student Management Route --------------------------------->>>

//Route for get all students from the datatbase
admin_route.get("/get_all_student", admin_auth, get_all_students)

//Route for block a student 
admin_route.put("/block_student", admin_auth, block_student)

//Route for unblock a student 
admin_route.put("/unblock_student", admin_auth, unblock_student)

//* <<<-------------------- Admin Instructor Management Route --------------------------------->>>

//Route for get all instructors from the datatbase
admin_route.get("/get_all_instructor", admin_auth, get_all_instructors)

//Route for block a instructor
admin_route.put("/block_instructor", admin_auth, block_instructor)

//Route for unblock a instructor
admin_route.put("/unblock_instructor", admin_auth, unblock_instructor)


//* <<<<--------------------- Admin Course Manangement --------------------------------------->>>>

// Route for get all courses created in this platform
admin_route.get("/get_all_courses", admin_auth, get_course_search_sort_filter)

admin_route.put("/block_course", admin_auth, block_course)

admin_route.put("/unblock_course", admin_auth, unblock_course)

//* <------------------------- Admin Dashboard ------------------------------------------>

admin_route.get("/get_platfrom_analytics", get_platform_analytics_data)

admin_route.get("/get_platform_revenueProfit_analytics", get_platform_revenueProfit_stats)

admin_route.get("/get_platform_enrollment_analytics", get_enrollment_analytics)

//* <-------------------------- Review & Rating management ------------------------------>

admin_route.get("/get_reviews/:id", admin_auth, get_reviews)

admin_route.put("/block_review", admin_auth, block_reviews)

admin_route.put("/unblock_review", admin_auth, unblock_reviews)

//* <--------------------------- Sales Management ---------------------------------------->

admin_route.get("/get_sales_report", admin_auth, get_sales_report)

admin_route.get("/get_download_sales_report_pdf", admin_auth, download_sales_report_pdf)

admin_route.get("/get_download_sales_report_excel", admin_auth, download_sales_report_excel)



//exporting admin_route module
export default admin_route