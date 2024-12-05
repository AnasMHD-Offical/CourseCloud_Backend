import course_model from "../models/course.js"
import mongoose from "mongoose";
import enrollment_model from "../models/enrollment.js";
const ObjectId = mongoose.Types.ObjectId

const get_instructor_dashboard_data = async (req, res) => {
    try {
        console.log("params id : ", req.params);

        const instructorId = new ObjectId(String(req.params.id)); // Convert ID to ObjectId

        const get_dashboard_data = await course_model.aggregate([
            { $match: { instructor_id: instructorId } }, // Filter courses by instructor_id
            {
                $addFields: {
                    actual_price_number: { $toDouble: "$actual_price" }, // Convert Decimal128 to Number
                    enrolled_count_safe: { $ifNull: ["$enrolled_count", 0] }, // Default to 0 if null
                    rating_safe: { $ifNull: ["$rating", 0] }, // Default to 0 if null
                }
            },
            {
                $group: {
                    _id: null, // Group all the courses for this instructor
                    totalPrice: { $sum: "$actual_price_number" }, // Sum of all course prices
                    totalEnrolled: { $sum: "$enrolled_count_safe" }, // Total enrolled students
                    totalRevenue: {
                        $sum: { $multiply: ["$actual_price_number", "$enrolled_count_safe"] } // Calculate total revenue
                    },
                    averageRating: { $avg: "$rating_safe" }, // Calculate average rating
                    courses: { $push: "$$ROOT" }, // Include all course details
                    courseCount: { $sum: 1 }
                }
            },

        ]);
        // console.log("=============== Dashboard data : ", get_dashboard_data);


        if (get_dashboard_data) {
            res.status(200)
                .json({ message: "Instructor dashboard data fetched successfully", success: true, dashboard_data: get_dashboard_data[0] || {} })
        } else {
            res.status(400)
                .json({ message: "unexpected error occurs while fetching the data", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}

const get_student_enrollment_data = async (req, res) => {
    try {

        const instructorId = new ObjectId(String(req.params.id)); // Convert instructor_id to ObjectId

        const enrollmentData = await enrollment_model.aggregate([
            // Match enrollments in the past 6 months
            {
                $match: {
                    date_of_purchase: {
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)), // Past 6 months
                        $lte: new Date() // Up to today
                    }
                }
            },
            // Lookup to join with course_model using course_id
            {
                $lookup: {
                    from: "courses", // Verify this matches exactly
                    localField: "course_id",
                    foreignField: "_id",
                    as: "course"
                }
            },
            // Unwind the joined course array
            {
                $unwind: "$course"
            },
            // Filter by instructor_id in the joined course
            {
                $match: {
                    "course.instructor_id": instructorId
                }
            },
            // Add month and year fields for grouping
            {
                $addFields: {
                    purchaseMonth: { $month: "$date_of_purchase" },
                    purchaseYear: { $year: "$date_of_purchase" }
                }
            },
            // Group by month and year
            {
                $group: {
                    _id: { month: "$purchaseMonth", year: "$purchaseYear" },
                    students: { $sum: 1 } // Count students
                }
            },
            // Sort by year and month
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            },
            // Project to format the output
            {
                $project: {
                    _id: 0,
                    month: {
                        $concat: [
                            {
                                $arrayElemAt: [
                                    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                                    { $subtract: ["$_id.month", 1] }
                                ]
                            },
                            " ",
                            { $toString: "$_id.year" }
                        ]
                    },
                    students: 1
                }
            }
        ]);

        // console.log("student_enrollment_data : ", enrollmentData);
        if (enrollmentData) {
            res.status(200)
                .json({ message: "Student enrollment data fetched successfully", success: true, student_enrollment_data: enrollmentData })
        } else {
            res.status(400)
                .json({ message: "unexpected error occurs while fetching the data", success: false })
        }


    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}

const get_revenue_data = async (req, res) => {
    try {
        const instructorId = new ObjectId(String(req.params.id));
        const revenueData = await enrollment_model.aggregate([
            // Match enrollments that occurred in the past 6 months
            {
                $match: {
                    payment_status: "completed", // Only consider completed payments
                    enrollment_status: true, // Only consider enrolled students
                    date_of_purchase: {
                        $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)), // 6 months ago
                        $lte: new Date() // Up to today
                    }
                }
            },
            // Lookup to join the course collection and get course price
            {
                $lookup: {
                    from: "courses", // Course collection
                    localField: "course_id", // Field in enrollment collection
                    foreignField: "_id", // Matching _id in course collection
                    as: "course" // Output field for course details
                }
            },
            // Unwind the course array to get the individual course details
            {
                $unwind: "$course"
            },
            //match based on the instructor id
            {
                $match: {
                    "course.instructor_id": instructorId
                }
            },
            // Add month and year fields from the date_of_purchase field
            {
                $addFields: {
                    purchaseMonth: { $month: "$date_of_purchase" }, // Extract month
                    purchaseYear: { $year: "$date_of_purchase" }, // Extract year
                    course_price_number: { $toDouble: "$course_price" },
                }
            },
            // Group by month and year to calculate revenue per month
            {
                $group: {
                    _id: { month: "$purchaseMonth", year: "$purchaseYear" },
                    revenue: {
                        $sum: { $multiply: ["$course_price_number", 1] } // Multiply course price by 1 to sum the revenue
                    }
                }
            },
            // Sort the results by year and month
            {
                $sort: { "_id.year": 1, "_id.month": 1 }
            },
            // // Project the results in the desired format
            {
                $project: {
                    _id: 0,
                    month: {
                        $concat: [
                            {
                                $arrayElemAt: [
                                    ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                                    { $subtract: ["$_id.month", 1] }
                                ]
                            },
                            " ",
                            { $toString: "$_id.year" }
                        ]
                    },
                    revenue: 1
                }
            }
        ]);

        console.log("Revenue data : ", revenueData);
        if (revenueData) {
            res.status(200)
                .json({ message: "revenue data fetched successfully", success: true, revenue_data: revenueData })
        } else {
            res.status(400)
                .json({ message: "unexpected error occurs while fetching the data", success: false })
        }

    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}


export {
    get_instructor_dashboard_data,
    get_student_enrollment_data,
    get_revenue_data
}