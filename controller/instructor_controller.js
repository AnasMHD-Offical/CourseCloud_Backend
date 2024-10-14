
//Controller for managing instructor login
const instructor_login = async (req, res) => {
    try {
        const {email , password} = req.body
        if(email && password){
            res.status(200)
            .json({message:"Instructor login successfully",success:true})
        }

    } catch (error) {
        res.status(500)
            .json({message:"Something went wrong",success:false, error:error })
    }
}

// exporting instructor controllers 
export {
    instructor_login
}