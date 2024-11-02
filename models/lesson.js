import mongoose from "mongoose";

const lesson_schema = mongoose.Schema({

    category_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course_model",
        // required: true
    },
    title: {
        type: String
    },
    description: {
        type: String
    },
    video_tutorial_link: {
        type: String
    },
    assignment_link: {
        type: String
    }
})

const lesson_model = mongoose.model("lession", lesson_schema)

export default lesson_model