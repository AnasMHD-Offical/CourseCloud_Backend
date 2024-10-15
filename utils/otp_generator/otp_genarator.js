import OtpGenerator from "otp-generator"

//function to generate otp  
export const generate_otp = async () => {
    return OtpGenerator.generate(6, { lowerCaseAlphabets : false, upperCaseAlphabets: false, specialChars: false })
}