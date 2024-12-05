import mongoose from "mongoose"

const course_progress_schema = mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student",
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
    },
    lesson_progress: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "lesson_progress"
        }]
    },
    quiz_progress: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: "quiz_progress"
        }]
    },
    course_progress: {
        type: Double
    },
    lessons_completed: {
        type: Number
    },
}, { timestamps: true })


const course_progress_model = mongoose.model("course_progress", course_progress_schema)

export default course_progress_model