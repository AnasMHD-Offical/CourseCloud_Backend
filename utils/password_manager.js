//importing bcrypt for password
import bcrypt from "bcrypt"


//Function for create a hashed password
export const hash_password = async (password) => {
    try {
        return await bcrypt.hash(password, 10)
    } catch (error) {
        console.log(error);
    }
}
//Function for comparing original_password and entered_password
export const compare_password = async (password, og_password) => {
    try {
        return await bcrypt.compare(password, og_password)
    } catch (error) {
        console.log(error);
    }
}
