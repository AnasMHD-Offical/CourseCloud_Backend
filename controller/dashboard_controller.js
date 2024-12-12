import course_model from "../models/course.js"
import mongoose from "mongoose";
import enrollment_model from "../models/enrollment.js";
import instructor_model from "../models/instuctor.js"
import student_model from "../models/student.js";
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



// const get_platform_analytics_data = async (req, res) => {
//     try {
//         // 1. Total students enrolled
//         const enrollmentData = await enrollment_model.aggregate([
//             {
//                 $group: {
//                     _id: "$course_id",
//                     total_students: { $addToSet: "$student_id" },
//                     total_revenue: { $sum: { $toDouble: "$course_price" } },

//                 }
//             },
//             {
//                 $project: {
//                     course_id: "$_id",
//                     total_students: { $size: "$total_students" },
//                     total_revenue: 1,
//                     _id: 0
//                 }
//             },
//             {
//                 $group: {
//                     _id: null,
//                     total_students: { $sum: "$total_students" },
//                     total_revenue: { $sum: "$total_revenue" },
//                 }
//             }
//         ]);

//         const totalStudents = enrollmentData[0]?.total_students || 0;
//         const totalRevenue = enrollmentData[0]?.total_revenue || 0;

//         // 2. Total instructors providing courses
//         const instructorData = await course_model.aggregate([
//             {
//                 $group: { _id: "$instructor_id" }
//             },
//             {
//                 $group: { _id: null, total_instructors: { $sum: 1 } }
//             }
//         ]);

//         const totalInstructors = instructorData[0]?.total_instructors || 0;

//         const totalCourses = await course_model.countDocuments();

//         // 4. Final Response
//         res.status(200).json({
//             message: "Platform data fetched successfully",
//             success: true,
//             platform_data: {
//                 totalStudents,
//                 totalInstructors,
//                 totalRevenue,
//                 totalCourses
//             }
//         });
//     } catch (error) {
//         console.error("Error in analyticsController:", error);
//         res.status(500).json({
//             success: false,
//             message: "An error occurred while fetching analytics data."
//         });
//     }

// }

const get_platform_analytics_data = async (req, res) => {
    try {
        // 1. Total students registered in the platform
        const totalRegisteredStudents = await student_model.countDocuments();

        // 2. Total instructors registered in the platform
        const totalRegisteredInstructors = await instructor_model.countDocuments();

        //registed courses in this platfrom 
        const totalRegistedCourses = await course_model.countDocuments()

        //registed courses in this platfrom 
        const totalActiveCourses = await course_model.countDocuments({ is_blocked: false })

        // 3. Active students (students who purchased a course)
        const activeStudentData = await enrollment_model.distinct("student_id");
        const totalActiveStudents = activeStudentData.length;

        // 4. Active instructors (instructors providing courses)
        const activeInstructorData = await course_model.distinct("instructor_id");
        const totalActiveInstructors = activeInstructorData.length;

        // 5. Total revenue generated (course price * enrolled count per course)
        const revenueData = await enrollment_model.aggregate([
            {
                $group: {
                    _id: "$course_id",
                    enrolled_count: { $addToSet: "$student_id" },
                    course_price: { $first: "$course_price" }
                }
            },
            {
                $project: {
                    enrolled_count: { $size: "$enrolled_count" },
                    revenue: { $multiply: [{ $size: "$enrolled_count" }, { $toDouble: "$course_price" }] }
                }
            },
            {
                $group: {
                    _id: null,
                    total_revenue: { $sum: "$revenue" }
                }
            }
        ]);

        const totalRevenue = revenueData[0]?.total_revenue || 0;

        // 6. Response
        res.status(200).json({
            message: "Platform data fetched successfully",
            success: true,
            platform_data: {
                totalRegisteredStudents,
                totalRegisteredInstructors,
                totalActiveStudents,
                totalActiveInstructors,
                totalRevenue,
                totalRegistedCourses,
                totalActiveCourses
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching analytics data.",
            error: error.message
        });
    }
};

const get_platform_revenueProfit_stats = async (req, res) => {
    try {
        const sixMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 6));

        const revenueData = await enrollment_model.aggregate([
            // Match enrollments from the last 6 months
            {
                $match: {
                    date_of_purchase: {
                        $gte: sixMonthsAgo, // Start date
                        $lte: new Date() // Current date
                    },
                    payment_status: "completed" // Optional: Only include completed payments
                }
            },
            // Convert price to a number (assuming it is stored as a string or Decimal128)
            {
                $addFields: {
                    price_number: { $toDouble: "$course_price" }
                }
            },
            // Extract month and year for grouping
            {
                $addFields: {
                    purchaseMonth: { $month: "$date_of_purchase" },
                    purchaseYear: { $year: "$date_of_purchase" }
                }
            },
            // Group by month and year to calculate revenue
            {
                $group: {
                    _id: { month: "$purchaseMonth", year: "$purchaseYear" },
                    revenue: { $sum: "$price_number" }
                }
            },
            // Sort by year and month
            {
                $sort: {
                    "_id.year": 1,
                    "_id.month": 1
                }
            },
            // Project to calculate profit and format output
            {
                $project: {
                    _id: 0,
                    name: {
                        $concat: [
                            {
                                $arrayElemAt: [
                                    ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
                                    { $subtract: ["$_id.month", 1] }
                                ]
                            },
                            " ",
                            { $toString: "$_id.year" }
                        ]
                    },
                    revenue: 1,
                    profit: { $multiply: ["$revenue", 0.03] }
                }
            }
        ]);
        if (revenueData) {
            res.status(200).json({ message: "Revenue data fetched successfully", success: true, revenue_data: revenueData });
        } else {
            res.status(400)
                .json({ message: "Unexpected error occurs while gettting the revenue data", success: false })
        }

    } catch (error) {
        console.error("Error fetching revenue data:", error);
        res.status(500).json({ message: "Error fetching revenue data", success: false, error: error.message });
    }
};

const get_enrollment_analytics = async (req, res) => {
    try {
        const sixMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 6));

        const enrollmentData = await enrollment_model.aggregate([
            // Match enrollments from the last 6 months
            {
                $match: {
                    date_of_purchase: {
                        $gte: sixMonthsAgo, // Start date
                        $lte: new Date() // Current date
                    },
                    enrollment_status: true // Optional: Only include active enrollments
                }
            },
            // Extract month and year for grouping
            {
                $addFields: {
                    enrollmentMonth: { $month: "$date_of_purchase" },
                    enrollmentYear: { $year: "$date_of_purchase" }
                }
            },
            // Group by month and year to count enrollments
            {
                $group: {
                    _id: { month: "$enrollmentMonth", year: "$enrollmentYear" },
                    enrollments: { $sum: 1 }
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
                    name: {
                        $concat: [
                            {
                                $arrayElemAt: [
                                    ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"],
                                    { $subtract: ["$_id.month", 1] }
                                ]
                            }
                        ]
                    },
                    enrollments: 1
                }
            }
        ]);
        if (enrollmentData) {
            res.status(200).json({ message: "Enrollment analytics fetched successfully ", success: true, enrollment_data: enrollmentData });
        } else {
            res.status(400).json({ message: "Unexpected error occurs while fetching enrollment data", success: false })
        }
    } catch (error) {
        console.error("Error fetching enrollment data:", error);
        res.status(500).json({ message: "Error fetching enrollment data", error: error.message });
    }
};

export {
    get_instructor_dashboard_data,
    get_student_enrollment_data,
    get_revenue_data,
    get_platform_analytics_data,
    get_platform_revenueProfit_stats,
    get_enrollment_analytics
}