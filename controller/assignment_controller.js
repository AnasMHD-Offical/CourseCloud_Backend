import assignment_progress_model from "../models/assignment_progress.js"


const update_assignment_progress = async (req, res) => {
    try {
        const { student_id, course_id, lesson_id, completed_assignment } = req.body
        const new_assignment_progress = new assignment_progress_model({
            student_id: student_id,
            course_id: course_id,
            lesson_id: lesson_id,
            completed_assignment: completed_assignment
        })
        const updated = await new_assignment_progress.save()
        if (updated) {
            res.status(200)
                .json({ message: "Assignment upload completed successfully. The result will update in the dashboard after instructor analysis", success: true })
        } else {
            res.status(400)
                .json({ message: "Unexpected error occurs. Try again", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}

export {
    update_assignment_progress,
}