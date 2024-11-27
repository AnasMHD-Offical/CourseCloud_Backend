import mongoose from "mongoose"

const review_schema = mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student",
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
    },
    rating: {
        type: Number
    },
    feedback: {
        type: String
    }
}, { timestamps: true })

const review_model = mongoose.model("review",review_schema)

export default review_model