import mongoose from "mongoose";

const cart_schema = mongoose.Schema({

    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student",
        // required: true
    },
    cart_items: [
        {
            course_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "course"
            },
            price: {
                type: mongoose.Schema.Types.Decimal128
            }
        }
    ]
})

const cart_model = mongoose.model("cart", cart_schema)

export default cart_model