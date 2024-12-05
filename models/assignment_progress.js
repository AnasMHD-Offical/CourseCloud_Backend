import mongoose from "mongoose";

const assignment_progress_schema = mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student",
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
    },
    lesson_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "lesson",
    },
    completed_assignment: {
        type: String,
    },
    submitted_date: {
        type: Date,
        default: Date.now()
    },
    assignment_total_score: {
        type: Number
    },
    assignment_given_score: {
        type: Number
    },
    assignment_status: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

const assignment_progress_model = mongoose.model("assignment_progress", assignment_progress_schema)

export default assignment_progress_model