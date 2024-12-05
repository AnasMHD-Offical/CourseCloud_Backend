
import { decode } from "jsonwebtoken"

//Middleware to verify the access token of admin
export const admin_auth = async (req, res, next) => {
    // const access_token = req.cookies.admin_access_token 
    const auth_headers = req.headers["authorization"]
    const access_token = auth_headers && auth_headers.startsWith("Bearer") ? auth_headers.split(" ")[1] : ""
    console.log(access_token);
    
    try {
        if (access_token) {
            console.log("hello");
            
            const verified = decode(access_token,process.env.JWT_ADMIN_ACCESS_TOKEN_SECRET)
            console.log(verified);
            
            if(verified){
                next()
            }else{
                res.status(403)
                    .json({message: "Access denied. Admin only access" , success:false})
            }
        } else {
            res.status(401)
                .json({ message: "Token Error. Token not found", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong", success: false, error })
    }
}

export const student_auth = async (req, res, next) => {
    // const access_token = req.cookies.admin_access_token 
    const auth_headers = req.headers["authorization"]
    const access_token = auth_headers && auth_headers.startsWith("Bearer") ? auth_headers.split(" ")[1] : ""
    // console.log(access_token);
    
    try {
        if (access_token) {
            // console.log("hello frm middleware");
            
            const verified = decode(access_token,process.env.JWT_STUDENT_ACCESS_TOKEN_SECRET)
            // console.log(verified);
            
            if(verified){
                req.user = verified?.data
                next()
            }else{
                res.status(403)
                    .json({message: "Access denied. student only access" , success:false})
            }
        } else {
            res.status(401)
                .json({ message: "Token Error. Token not found", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong", success: false, error })
    }
}