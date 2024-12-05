import mongoose from "mongoose"

const video_tutorial_progress_schema = mongoose.Schema({
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
    video_tutorial_duration: {
        type: Number
    },
    recently_watched_time: {
        type: Number
    },
    tutorial_completed: {
        type: Boolean
    },

}, { timestamps: true })

const video_tutorial_progress_model = mongoose.model("video_tutorial_progress", video_tutorial_progress_schema)

export default video_tutorial_progress_model