//importing essential Es6 modules
import mongoose from "mongoose";

const student_schema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    profile: {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    dob: {
        type: String,
        required: true
    },
    googleId:{
        type:String,
        sparse:true,
    },
    is_blocked:{
        type:Boolean,
        default:false
    },
    created_at: {
        type: Date,
        default: Date.now()
    }

})

const student_model = mongoose.model("student", student_schema)

export default student_model
