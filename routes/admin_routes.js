//Importing Es modules
import express from "express"
import { admin_login } from "../controller/admin_controller.js"
const admin_route = express.Router()

//Route for admin login
admin_route.post("/admin_login", admin_login)

//exporting admin_route module
export default admin_route