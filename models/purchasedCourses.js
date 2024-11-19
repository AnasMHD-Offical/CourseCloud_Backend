import mongoose from "mongoose";


const purchasedCourseSchema = mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "student",
        required: true
    },
    courses: [
        {
            course_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "course"
            },
            price: {
                type: String
            },
            DateOfPurchase: {
                type: Date
            },
            enrollment_id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "enrollment"
            }
        }
    ]
})

const purchasedCourse_model = mongoose.model("purchasedCourse", purchasedCourseSchema)

export default purchasedCourse_model