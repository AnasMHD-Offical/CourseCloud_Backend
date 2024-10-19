import mongoose from "mongoose"

const category_schema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    sub_category: {
        type: mongoose.Schema.Types.Array
    },
    status: {
        type: Boolean,
        default: true
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: Date.now()
    }
})

const category_model = mongoose.model("category", category_schema)

export default category_model