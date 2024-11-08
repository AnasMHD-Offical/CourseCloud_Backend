import mongoose from "mongoose";

const wishlist_schema = mongoose.Schema({

    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student",
        // required: true
    },
    wishlist_items: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "course"
        }
    ]
})

const wishlist_model = mongoose.model("wishlist", wishlist_schema)

export default wishlist_model