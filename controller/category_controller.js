import category_model from "../models/category.js"

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



export {
    get_category
}