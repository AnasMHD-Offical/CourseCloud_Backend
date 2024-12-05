import saved_notes_model from "../models/saved_notes.js"



const create_notes = async (req, res) => {
    try {
        const { student_id, course_id, lesson_id, tutorial_note_timing, notes } = req.body

        const new_notes = new saved_notes_model({
            student_id,
            course_id,
            lesson_id,
            tutorial_note_timing,
            notes
        })
        const saved = await new_notes.save()
        if (saved) {
            res.status(200)
                .json({ message: "saved note created and saved successfully", success: true })
        } else {
            res.status(400)
                .json({ message: "Unexpected error occurs while saving on the db", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}

const delete_note = async (req, res) => {
    try {
        console.log(req.params);
        
        const delete_note = await saved_notes_model.findByIdAndDelete({ _id: req.params.id })
        if (delete_note) {
            res.status(200)
                .json({ message: "note deleted successfully", success: true })
        } else {
            res.status(400)
                .json({ message: "Unexpected error occurs while deleting note", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}

const get_saved_notes = async (req, res) => {
    try {
        const { student_id, course_id, lesson_id } = req.query
        const get_saved_notes = await saved_notes_model.find({ student_id, lesson_id })
        if (get_saved_notes) {
            res.status(200)
                .json({ message: "saved notes fetched successfully", success: true, saved_notes: get_saved_notes })
        } else {
            res.status(404)
                .json({ message: "saved notes not found", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}

export {
    create_notes,
    get_saved_notes,
    delete_note
}