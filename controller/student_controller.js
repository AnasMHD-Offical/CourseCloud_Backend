
//Controller to handle student login 
const student_login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (email && password) {
            res.status(200)
                .json({ message: "Student login successfully", success: true })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong", success: false })
    }
}
//controller to handle student Register.
const student_register = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(200)
            .json({ message: "Something went wrong", success: false })
    }
}

//exporting student controllers
export {
    student_login
}