// Importing Es modules 
import express from "express"
import { student_login, student_register, send_otp, validate_otp, refresh_token, reset_password, student_logout, get_courses, get_course, get_courses_by_category, get_cart, add_to_cart, remove_from_cart, add_to_wishlist, get_wishlist, remove_from_wishlist, get_student_data, edit_profile } from "../controller/student_controller.js"
import { get_category } from "../controller/category_controller.js"
const student_route = express.Router()

//* <-------------------------- Student Auth Routes ------------------------------------->
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

//Route for student logout
student_route.post("/student_logout", student_logout)


//*<--------------------------- Student Landing page & Home Page Routes ------------------------>

//Route for handling get category
student_route.get("/get_category", get_category)

//Route for get courses 
student_route.get("/get_courses", get_courses)

//Route for get a course based on the course id 
student_route.get("/get_course/:id", get_course)

//Route for get a course based on the category and sub category
student_route.get("/get_courses_by_category/:id/:subcategory", get_courses_by_category)

//Route for get cart for each user
student_route.get("/get_cart/:id", get_cart)

//Route for add an items to the cart 
student_route.put("/add_to_cart", add_to_cart)

//Route for remove an item from cart 
student_route.delete("/remove_from_cart/:student_id/:course_id", remove_from_cart)

//Route for get wishlisted courses
student_route.get("/get_wishlist/:id", get_wishlist)

//Route for add item to wishlist 
student_route.put("/add_to_wishlist", add_to_wishlist)

//Route for removing items from wishlist
student_route.delete(`/remove_from_wishlist/:student_id/:course_id`, remove_from_wishlist)

student_route.get("/get_student_data/:id", get_student_data)

student_route.put("/edit_profile",edit_profile)

// Exporting student_route module
export default student_route