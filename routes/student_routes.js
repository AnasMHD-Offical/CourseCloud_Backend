// Importing Es modules 
import express from "express"
import { student_login } from "../controller/student_controller.js"
const student_route = express.Router()

//Route for student login 
student_route.post("/student_login", student_login)

//Route for student register
student_route.post("")

// Exporting student_route module
export default student_route