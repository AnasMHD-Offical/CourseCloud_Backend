

//Controller for handle admin login
const admin_login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (email && password) {
            res.status(200)
                .json({ message: "Admin login successfully", success: true })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong", success: false, error: error })
    }
}

//exporting admin controllers
export {
    admin_login
}