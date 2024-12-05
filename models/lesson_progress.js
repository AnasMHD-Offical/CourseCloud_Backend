import mongoose from "mongoose"

const lesson_progress_schema = mongoose.Schema({
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
    assignment_progress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "assignment_progress"
    },
    video_progress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "video_progress",
    },
    video_tutorial_completed: {
        type: Boolean,
    },
    assignment_completed: {
        type: Boolean,
    },
    lesson_completed: {
        type: Boolean,
        default: false
    },
    lesson_progress: {
        type: Number
    },
}, { timestamps: true })


const lesson_progress_model = mongoose.model("lesson_progress", lesson_progress_schema)

export default lesson_progress_model