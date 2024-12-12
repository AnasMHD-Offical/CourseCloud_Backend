import course_model from "../models/course.js"
import review_model from "../models/review.js"



const create_review = async (req, res) => {
    try {
        const { student_id, course_id, rating, feedback } = req.body
        const new_review = new review_model({
            student_id: student_id,
            course_id: course_id,
            rating: rating,
            feedback: feedback
        })
        const created_review = await new_review.save()
        if (created_review) {
            const get_rating = await review_model.aggregate([
                {
                    $group: {
                        _id: null, // No grouping by specific fields; calculate for all documents
                        averageRating: { $avg: "$rating" }, // Calculate the average of the "rating" field
                    },
                },
            ]);
            if (get_rating) {
                const get_course = await course_model.findOne({ _id: course_id })
                get_course.rating = get_rating[0]?.averageRating || 0
                await get_course.save()
                res.status(200)
                    .json({ message: "Review added successfully. Thankyou For Your Valuable Feedback!", success: true })
            }
        } else {
            res.status(400)
                .json({ message: "Unexpected error occurs. Try again", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}

const get_reviews = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1
        const limit = parseInt(req.query.limit) || Infinity

        const get_review = await review_model.find({ course_id: req.params.id }).populate("student_id", { name: true, profile: true }).skip(page === 1 ? 0 : (page - 1) * limit).limit(limit)
        const review_count = await review_model.countDocuments({ course_id: req.params.id })
        const get_rating = await course_model.findOne({ _id: req.params.id }, { rating: 1, _id: 0 })
        console.log(get_rating, "Ratting-----------");

        if (get_review) {
            res.status(200)
                .json({ message: "reviews fetched successfully", success: true, reviews: get_review, review_count: review_count, Course_rating: get_rating?.rating || 0 })
        } else {
            res.status(404)
                .json({ message: "reviews not found", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}

const block_reviews = async (req, res) => {
    try {
        const get_review = await review_model.findOne({ _id: req.body._id })
        if (get_review) {
            get_review.is_blocked = true
            await get_review.save()
            res.status(200)
                .json({ message: "Review blocked successfully", success: true })
        } else {
            res.status(404)
                .json({ message: "reviews not found", success: false })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}

const unblock_reviews = async (req, res) => {
    try {
        const get_review = await review_model.findOne({ _id: req.body._id })
        if (get_review) {
            get_review.is_blocked = false
            await get_review.save()
            res.status(200)
                .json({ message: "Review unblocked successfully", success: true })
        } else {
            res.status(404)
                .json({ message: "reviews not found", success: false })
        }
    } catch (error) {
        console.log(error.message);
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}


export {
    create_review,
    get_reviews,
    block_reviews,
    unblock_reviews
}