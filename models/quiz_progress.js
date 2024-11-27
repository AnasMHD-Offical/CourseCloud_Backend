import mongoose from "mongoose";

const quiz_progress_schema = mongoose.Schema({
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
    total_score: {
        type: Number,
    },
    student_scored: {
        type: Number,
    },
    time_taken: {
        type: String
    },
    difficulty:{
        type:String
    }
},{ timestamps: true })

const quiz_progress_model = mongoose.model("quiz_progress", quiz_progress_schema)

export default quiz_progress_model