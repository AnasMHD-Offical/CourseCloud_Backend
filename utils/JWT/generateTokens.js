import jwt from "jsonwebtoken"



export const generate_access_token = (role, data) => {
    if (role === "student") {
        return jwt.sign({ data }, process.env.JWT_STUDENT_ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES
        })
    } else if (role === "instructor") {
        return jwt.sign({ data }, process.env.JWT_INSTRUCTOR_ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES
        })
    } else if (role === "admin") {
        return jwt.sign({ data }, JWT_ADMIN_ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES
        })
    }
}

export const generate_refresh_token = (role, data) => { 
    if (role === "student") {
        return jwt.sign({ data }, process.env.JWT_STUDENT_REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES
        })
    } else if (role === "instructor") {
        return jwt.sign({ data }, process.env.JWT_INSTRUCTOR_REFRESH_TOKEN_SECRET , {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES
        })
    } else if (role === "admin") {
        return jwt.sign({ data }, JWT_ADMIN_REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES
        })
    }
}