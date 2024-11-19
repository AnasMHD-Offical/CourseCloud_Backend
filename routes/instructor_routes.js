//Importing Es modules
import express from "express"
import { instructor_login, instructor_register, send_otp, validate_otp, reset_password, get_instructor, edit_instructor, add_course, get_created_courses, get_course, edit_course, instructor_logout } from "../controller/instructor_controller.js"
import { get_category } from "../controller/category_controller.js"
const instructor_route = express.Router()


//* <---------------------------Instructor Auth Routes-------------------------------->
//Routes for instructor login
instructor_route.post("/instructor_login", instructor_login)

//Route for instructor registration
instructor_route.post("/instructor_register", instructor_register)

//Route for instructor sent otp
instructor_route.post("/send_otp", send_otp)

//Route for instructor validate otp
instructor_route.post("/validate_otp", validate_otp)

//Route for instructor reset password
instructor_route.put("/reset_password", reset_password)

instructor_route.post("/instructor_logout",instructor_logout)

//*<----------------------Instructor Profile Management Routes------------------------->

//Route for get_instructor
instructor_route.get("/get_instructor/:id", get_instructor)

//Route for edit instructor
instructor_route.put("/edit_instructor", edit_instructor)

//* <----------------------- Instructor create course ---------------------------------->

//Route for get course category to instructor side
instructor_route.get("/get_category_instructor", get_category)

instructor_route.post("/add_course", add_course)

instructor_route.get("/get_created_courses/:id", get_created_courses)

instructor_route.get("/get_course/:id", get_course)

instructor_route.put("/edit_course", edit_course)




//Exporting instructor_route module
export default instructor_route