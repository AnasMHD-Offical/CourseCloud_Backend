//Importing essential modules using ES modules 
//* ^|-> NB: Gives proirity to import modules for readability and perfromance.

import dotenv from "dotenv"
import express from "express"
import cors from "cors"
import path from "path"
import session from "express-session"
import cookieParser from "cookie-parser"
import passport from "passport"
import { fileURLToPath } from "url"

// configuring __dirname in Es module
 
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Initialise app from express
const app = express()

app.get("/",(req,res)=>{
    res.send("Hello world")
})

// listerning to the port in env file
const PORT = process.env.PORT || 3000
app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
})   