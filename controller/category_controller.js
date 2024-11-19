import category_model from "../models/category.js"
import course_model from "../models/course.js"

const get_category = async (req, res) => {
    try {
        const categories = await category_model.find({ status: true }).sort({ title: 1 })
        // console.log(categories);

        if (categories) {
            res.status(200).json({ message: "Categories fetched successfully", success: true, categories })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong", success: false, error })
    }
}

const course_search_sort_filter = async (req, res) => {
    try {
        console.log(req.query);
        const page = parseInt(req.query.page) || 0
        const limit = parseInt(req.query.limit) || 5
        const search = req.query.search || ""
        const sort = req.query.sort || 1
        const category = req.query.category || "all"
        const subcategory = req.query.subcategory || "all"
        const rating = req.query.rating || "all"
        const difficulty = req.query.difficulty || "all"
        const starting_price = req.query.starting_price || 0
        const Ending_price = req.query.Ending_price || Infinity


        const filterQuery = {
            is_blocked: false,
            ...(search !== ""
                ? { title: { $regex: new RegExp(`^${search}$`, 'i') } }
                : {}
            ),
            ...(category !== "all"
                ? { category: category }
                : {}
            ),
            ...(subcategory !== "all"
                ? { subCategory: subcategory }
                : {}
            ),
            ...(rating !== "all"
                ? { rating: { $lte: rating, $gte: (rating - 1) } }
                : {}
            ),
            ...(difficulty !== "all"
                ? { difficulty: difficulty }
                : {}
            ),
            ...(starting_price > 0 || Ending_price < Infinity
                ? { actual_price: { $gte: Number(starting_price), $lte: Number(Ending_price) } }
                : {}
            )

        }

        const getSortOrder = (sort) => {
            switch (sort) {
                case "popularity":
                    return { ratings: -1 };
                case "newest":
                    return { createdAt: -1 };
                case "oldest":
                    return { createdAt: 1 };
                case "PriceAsc":
                    return { actual_price: 1 };
                case "PriceDes":
                    return { actual_price: -1 };
                case "AlphaDes":
                    return { title: -1 };
                case "AlphaAsc":
                    return { title: 1 };
                default:
                    return;
            }
        }




        const get_courses = await course_model.find(filterQuery).sort(getSortOrder(sort)).limit(limit).skip(page === 1 ? 0 : (page - 1) * limit)
        console.log(get_courses);
        if (get_courses.length > 0 || get_total_courseCount.length > 0) {
            res.status(200)
                .json({ message: "Courses filtered and fetched successfully", success: true, courses: get_courses })
        } else {
            res.status(404)
                .json({ message: "Courses not found", success: false })
        }



    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong. Try again", success: false, error: error.message })
    }
}

const get_courses_length = async (req, res) => {
    try {
        const get_total_courseCount = await course_model.find()
        if (get_total_courseCount.length > 0) {
            res.status(200)
                .json({ message: "Courses count fetched successfully", success: true, totalCourses: get_total_courseCount.length })
        } else {
            res.status(404)
                .json({ message: "Courses count not found", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went wrong. Try again", success: false, error: error.message })
    }
}


export {
    get_category,
    course_search_sort_filter,
    get_courses_length
}