// import { populate } from "dotenv";
import cart_model from "../models/cart.js";
import course_model from "../models/course.js";
import enrollment_model from "../models/enrollment.js";
import purchasedCourse_model from "../models/purchasedCourses.js";
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUDNAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
});

const createEnrollment = async (req, res) => {
    try {
        const { student_id, courses, payment_id } = req.body.data
        const enrollments = await Promise.all(
            courses.map(async (course, index) => {
                try {
                    // console.log("Creating course enrollement:", course);  // Log course data

                    const new_enrollment = new enrollment_model({
                        student_id: student_id,
                        course_id: course?.course_id?._id,
                        payment_status: "completed",
                        payment_method: "Razorpay",
                        transaction_id: payment_id,
                        course_price: course?.price,
                        enrollment_status: true
                    })

                    const enrolled = await new_enrollment.save();
                    console.log("Enrollment created successfully:", enrolled);
                    if (enrolled) {
                        const get_course = await course_model.findOne({ _id: enrolled.course_id })
                        get_course.enrolled_count += 1
                        await get_course.save()
                        return { enrollment_id: enrolled._id, DateOfPurchase: enrolled.date_of_purchase, course_id: enrolled.course_id, price: enrolled.course_price };
                    }
                } catch (error) {
                    console.error("Error creating course:", error);
                    throw new Error(`Error creating course "${index}": ${error.message}`);
                }
            })
        );
        if (enrollments) {
            const get_purchased_courses = await purchasedCourse_model.findOne({ student_id: student_id })
            if (get_purchased_courses) {
                get_purchased_courses.courses = [...get_purchased_courses.courses, enrollments].flat(2)
                console.log(get_purchased_courses.courses);
                const saved_enrollments = await get_purchased_courses.save()
                if (saved_enrollments) {
                    const get_cart = await cart_model.findOne({ student_id })
                    console.log(get_cart);
                    get_cart.cart_items = []
                    const remove_item_from_cart = await get_cart.save()
                    if (remove_item_from_cart) {
                        res.status(200)
                            .json({ message: "Course enrolled successfully", success: true, enrollments })
                    } else {
                        res.status(400)
                            .json({ message: "Unexpected error occured . Try again", success: false })
                    }
                } else {
                    res.status(400)
                        .json({ message: "Unexpected error occured . Try again", success: false })
                }

            } else {
                const new_purchasedCourses = new purchasedCourse_model({
                    student_id: student_id,
                    courses: [...enrollments]
                })
                const createdPurchasedCourses = new_purchasedCourses.save()
                if (createdPurchasedCourses) {
                    const get_cart = await cart_model.findOne({ student_id })
                    console.log(get_cart);
                    get_cart.cart_items = []
                    const remove_item_from_cart = await get_cart.save()
                    if (remove_item_from_cart) {
                        res.status(200)
                            .json({ message: "Course enrolled successfully. Course Added to my course", success: true, enrollments })
                    } else {
                        res.status(400)
                            .json({ message: "Unexpected error occured . Try again", success: false })
                    }
                } else {
                    res.status(400)
                        .json({ message: "Unexpected error occured . Try again", success: false })
                }
            }
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong. Try again", success: false, error: error.message })
    }
}

const get_purchased_courses = async (req, res) => {
    try {
        const { id } = req.params
        const get_purchased_course = await purchasedCourse_model.findOne({ student_id: id }).populate({ path: "courses", populate: { path: "course_id", model: "course" } })
        // console.log(get_purchased_course);
        const Courses_duration = await Promise.all(
            get_purchased_course?.courses.map(async (course, index) => {
                try {
                    const get_course = await course_model.findOne({ _id: course?.course_id?._id }).populate("lessons")
                    if (get_course) {
                        // console.log(get_course?.lessons);

                        let totalDuration = 0;
                        for (const lesson of get_course?.lessons || []) {
                            try {
                                // console.log("lesson link : ", lesson?.video_tutorial_link);

                                const videoDetails = await cloudinary.api.resource(lesson?.video_tutorial_link, {
                                    resource_type: "video",
                                    media_metadata: true,
                                    prefix: "CourseCloud_Tutorials"
                                });
                                // console.log("Video details", videoDetails.duration / 60);

                                totalDuration += (videoDetails.duration / 60);
                            } catch (error) {
                                if (error?.error?.http_code === 404) {
                                    console.error(`Video not found for lesson: ${lesson.title}, ID: ${lesson._id}, Link: ${lesson?.video_tutorial_link}`);
                                } else {
                                    console.error(`Error retrieving video details for lesson: ${lesson.title}, ID: ${lesson._id}`, error);
                                    throw new Error(`Error retrieving video details: ${error.message}`);
                                }
                            }
                        }
                        const CourseDuration = totalDuration;

                        return { duration: CourseDuration, course_id: course?.course_id?._id }
                    }
                } catch (error) {
                    console.error("Error creating course:", error);
                    throw new Error(`Error creating course "${index}": ${error.message}`);
                }
            })
        );

        if (get_purchased_course && Courses_duration) {
            res.status(200)
                .json({ message: "Purchased courses fetched successfully", success: true, purchased_courses: get_purchased_course, Courses_duration: Courses_duration })
        } else {
            res.status(400)
                .json({ message: "Unexpected error occured . Try again", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong. Try again", success: false, error: error.message })
    }
}

const get_course_data = async (req, res) => {
    try {
        const get_course_data = await course_model.findOne({ _id: req.params.id }, { title: true, description: true })
        if (get_course_data) {
            res.status(200)
                .json({ message: "Course data fetched successfully", success: true, course: get_course_data })
        } else {
            res.status(404)
                .json({ message: "Course Not found . Try again", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong. Try again", success: false, error: error.message })
    }
}


export {
    createEnrollment,
    get_purchased_courses,
    get_course_data
}



