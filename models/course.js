import mongoose from "mongoose";

const course_schema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    subtitle: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    instructor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "instructor_model",
        required: true
    },
    language: {
        type: String,
    },
    difficulty: {
        type: String
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
    },
    subCategory: {
        type: String
    },
    lessions: {
        type: mongoose.Schema.Types.Array,
        required: true
    },
    thumbnail: {
        type: String
    },
    entrolled_count: {
        type: Number
    },
    actual_price: {
        type: String,
    },
    given_price: {
        type: String
    },
    features: {
        type: [String]
    },
    captions: {
        type: [String]
    },
    objectives: {
        type: [String]
    },
    rating: {
        type: String
    },
    is_blocked: {
        type: Boolean,
        default: false
    },
    offer_percentage: {
        type: String
    },
    target_students: {
        type: String
    },
    subject: {
        type: String
    }

}, { timestamps: true })

const course_model = mongoose.model("course",course_schema)

export default course_model