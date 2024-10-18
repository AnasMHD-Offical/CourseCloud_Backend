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
    },
    profile: {
        type: String
    },
    password: {
        type: String,
    },
    dob: {
        type: String,
    },
    googleId: {
        type: String,
        sparse: true,
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    created_at: {
        type: Date,
        default: Date.now()
    },

})

const student_model = mongoose.model("student", student_schema)

export default student_model
