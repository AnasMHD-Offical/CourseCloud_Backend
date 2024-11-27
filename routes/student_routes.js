// Importing Es modules 
import express from "express"
import { student_login, student_register, send_otp, validate_otp, refresh_token, reset_password, student_logout, get_courses, get_course, get_courses_by_category, get_cart, add_to_cart, remove_from_cart, add_to_wishlist, get_wishlist, remove_from_wishlist, get_student_data, edit_profile } from "../controller/student_controller.js"
import { course_search_sort_filter, get_category, get_courses_length } from "../controller/category_controller.js"
import { student_auth } from "../middlewares/Auth.js"
import { createEnrollment, get_purchased_courses } from "../controller/enrollment_controller.js"
import { get_quizzes, store_results } from "../controller/quiz_controller.js"
import { update_assignment_progress } from "../controller/assignment_controller.js"
import { create_review, get_reviews } from "../controller/review_controller.js"
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

// * <----------------------------- Cart management -------------------------------------------->
//Route for get cart for each user
student_route.get("/get_cart/:id", student_auth, get_cart)

//Route for add an items to the cart 
student_route.put("/add_to_cart", student_auth, add_to_cart)

//Route for remove an item from cart 
student_route.delete("/remove_from_cart/:student_id/:course_id", student_auth, remove_from_cart)

//* <------------------------------ Wishlist management ---------------------------------------->
//Route for get wishlisted courses
student_route.get("/get_wishlist/:id", student_auth, get_wishlist)

//Route for add item to wishlist 
student_route.put("/add_to_wishlist", student_auth, add_to_wishlist)

//Route for removing items from wishlist
student_route.delete(`/remove_from_wishlist/:student_id/:course_id`, student_auth, remove_from_wishlist)

//* <----------------------------- Profile Management ----------------------------------------->

//Route for getting the student data for display in the profile
student_route.get("/get_student_data/:id", student_auth, get_student_data)

//Route for edit student data
student_route.put("/edit_profile", student_auth, edit_profile)


//* <------------------------------ Enrollment Managment ------------------------------------->

// Route for create enrollement for the student to purchase the course 
student_route.post("/create_enrollment", student_auth, createEnrollment)

// Route for get the purchased course 
student_route.get("/get_purchased_courses/:id", student_auth, get_purchased_courses)

//Route for get the course by filter, sort and search.
student_route.get("/get_course_by_search_sort_filter", course_search_sort_filter)

student_route.get("/get_course_length", get_courses_length)

//Route for create quiz using gemini AI
student_route.get("/create_quizess", student_auth, get_quizzes)

//Route for storing the quiz result in database.
student_route.post("/store_results", student_auth, store_results)

//Route for update the assignment in the assignment progress for instructor validation.
student_route.put("/update_assignment_progress", student_auth, update_assignment_progress)

student_route.post("/create_review", student_auth, create_review)

student_route.get("/get_reviews/:id", student_auth, get_reviews)

// Exporting student_route module
export default student_route