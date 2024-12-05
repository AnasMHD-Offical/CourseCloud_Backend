import course_model from "../models/course.js"

const get_instructor_dashboard_data = async (req, res) => {
    try {
        const get_dashboard_data = await course_model.aggregate([
            { $match: { instructor_id: req.params.id } }, // Filter courses by instructor_id
            // {
            //   $addFields: {
            //     actual_price_number: { $toDouble: "$actual_price" } // Convert Decimal128 to Number
            //   }
            // },
            {
              $group: {
                _id: null, // Group all the courses for this instructor
                totalPrice: { $sum: "$actual_price_number" }, // Sum of all course prices
                totalEnrolled: { $sum: "$enrolled_count" }, // Total enrolled students
                // totalRevenue: {
                //   $sum: { $multiply: ["$actual_price_number", "$enrolled_count"] } // Calculate total revenue
                // },
                // averageRating: { $avg: "$rating" }, // Calculate average rating (ensure rating exists in schema)
                // courses: { $push: "$$ROOT" } // Optional: Include all course details
              }
            },
            {
              $project: {
                _id: 0, // Remove the _id field from the result
                totalPrice: 1,
                totalEnrolled: 1,
                // totalRevenue: 1,
                averageRating: 1,
                // courses: 1 // Optional: Include course details
              }
            }
          ]);
          
        //   // Send the response
        //   res.json({
        //     status: "success",
        //     data: get_dashboard_data[0] || {}, // Return the first result or an empty object
        //   });
          

        if (get_dashboard_data) {
            res.status(200)
                .json({ message: "Instructor dashboard data fetched successfully", success: true, dashboard_data: get_dashboard_data})
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
    get_instructor_dashboard_data
}