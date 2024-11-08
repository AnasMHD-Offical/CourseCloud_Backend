import mongoose from "mongoose";

const instructor_schema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String
    },
    profile: {
        type: String
    },
    password: {
        type: String
    },
    about: {
        type: String
    },
    proffession: {
        type: String
    },
    dob: {
        type: String
    },
    googleId: {
        type: String,
        sparse: true,
    },
    joined_at: {
        type: Date,
        default: Date.now()
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    total_revenue: {
        type: String,
    },
    avg_course_revenue: {
        type: String
    }
})
const instructor_model = mongoose.model("instructor", instructor_schema)
export default instructor_model