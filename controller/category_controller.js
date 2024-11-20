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

//Controller to handle course search, sort , filter opertions in course db
const course_search_sort_filter = async (req, res) => {
    try {
        console.log(req.query);
        // Getting the queries from the url
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

        // Object that contained the conditions to filter out data from the db
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

        //function to sort the db based on the user selection
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
                    return { createdAt: -1 };
            }
        }

        //Getting the filtered, sorted , paginated data from the db 
        const get_courses = await course_model.find(filterQuery).sort(getSortOrder(sort)).skip(page === 1 ? 0 : (page - 1) * limit).limit(limit)
        console.log(get_courses);
        const totalPage = await course_model.countDocuments(filterQuery)

        //checking the data is getting or not if the condition satifies then it will sent a resolved response otherwise it will throw a rejected response
        if (get_courses) {
            res.status(200)
                .json({ message: "Courses filtered and fetched successfully", success: true, courses: get_courses , totalPage:totalPage})
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