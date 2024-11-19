import mongoose from "mongoose";

const enrollment_schema = mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student",
        required: true
    },
    course_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "course",
        required: true
    },
    payment_status: {
        type: String
    },
    payment_method: {
        type: String
    },
    date_of_purchase: {
        type: Date,
        default: Date.now()
    },
    transaction_id: {
        type: String
    },
    course_price: {
        type: mongoose.Schema.Types.Decimal128
    },
    enrollment_status: {
        type: Boolean,
        default: true
    }
})

const enrollment_model = mongoose.model("enrollment", enrollment_schema)

export default enrollment_model