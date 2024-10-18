import mongoose from "mongoose";
const refresh_token_schema = mongoose.Schema({
    token: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true
    },
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student_model",
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
})

const refresh_token_model = mongoose.model("Refresh_Token", refresh_token_schema)

export default refresh_token_model