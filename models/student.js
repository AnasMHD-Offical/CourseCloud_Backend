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
    phone: {
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

})