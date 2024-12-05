import mongoose from "mongoose"

const saved_notes_schema = mongoose.Schema({
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
    tutorial_note_timing: {
        type: Number
    },
    notes: {
        type: String
    }
}, { timestamps: true })

const saved_notes_model = mongoose.model("saved_note",saved_notes_schema)

export default saved_notes_model