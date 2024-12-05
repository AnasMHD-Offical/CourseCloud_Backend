import lesson_progress_model from "../models/lesson_progress.js"
import video_tutorial_progress_model from "../models/video_progress.js"


const update_video_progress = async (req, res) => {
    try {
        const { student_id, course_id, lesson_id, duration, recent_whatched_time } = req.body
        const get_video_progress = await video_tutorial_progress_model.findOne({ lesson_id })
        if (get_video_progress) {
            get_video_progress.recently_watched_time = recent_whatched_time
            get_video_progress.tutorial_completed = recent_whatched_time === duration ? true : false
            get_video_progress.video_tutorial_duration = duration
            const updated = await get_video_progress.save()
            
            if (updated) {
                res.status(200)
                    .json({ message: "video progress updated successfully", success: true, video_progress: updated })
            } else {
                res.status(404)
                    .json({ message: "unexpected error occurs", success: false })
            }
        } else {
            const new_video_progress = new video_tutorial_progress_model({
                student_id: student_id,
                course_id: course_id,
                lesson_id: lesson_id,
                video_tutorial_duration: duration,
                recently_watched_time: recent_whatched_time,
                tutorial_completed: recent_whatched_time === duration ? true : false,
            })
            const created = await new_video_progress.save()
            if (created) {
                res.status(200)
                    .json({ message: "video progress created and updated successfully", success: true, video_progress: created })
            } else {
                res.status(404)
                    .json({ message: "unexpected error occurs", success: false })

            }
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message }).status(500)
    }
}

const get_video_progress = async (req, res) => {
    try {

        const { student_id, lesson_id, course_id } = req.query
        const get_video_progress = await video_tutorial_progress_model.findOne({ student_id, lesson_id })
        console.log(get_video_progress);

        if (get_video_progress) {
            res.status(200)
                .json({ message: "video progress fetched successfully", success: true, video_progress: get_video_progress })
        } else {
            if (course_id && lesson_id) {

                const new_video_progress = new video_tutorial_progress_model({
                    student_id: student_id,
                    course_id: course_id,
                    lesson_id: lesson_id,
                    video_tutorial_duration: 0,
                    recently_watched_time: 0,
                    tutorial_completed: false,
                })
                const created = await new_video_progress.save()
                if (created) {
                    res.status(200)
                        .json({ message: "video progress created and updated successfully", success: true, video_progress: created })
                } else {
                    res.status(404)
                        .json({ message: "unexpected error occurs", success: false })

                }
            } else {
                res.status(404)
                    .json({ message: "unexpected error occurs", success: false })

            }
        }

    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}

const create_lesson_progress = async (req, res) => {
    try {
        const { student_id, course_id, lesson_id } = req.body
        const new_lesson_progress = new lesson_progress_model({
            student_id,
            course_id,
            lesson_id,
        })
        const created = await new_lesson_progress.save()
        if (created) {
            if (created) {
                res.status(200)
                    .json({ message: "lesson progress created successfully", success: true })
            } else {
                res.status(404)
                    .json({ message: "unexpected error occurs", success: false })
            }
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}

const update_lesson_progress = async (req, res) => {
    try {
        const { tutorial_completed, assignment_completed, student_id, course_id, lesson_id ,video_progress} = req.body
        const get_lesson_progress = await lesson_progress_model.findOne({ lesson_id })
        if (get_lesson_progress) {
            tutorial_completed ? get_lesson_progress.video_tutorial_completed = tutorial_completed : null
            assignment_completed ? get_lesson_progress.assignment_completed = assignment_completed : null
            if (get_lesson_progress?.video_tutorial_completed && get_lesson_progress?.assignment_completed) {
                get_lesson_progress.lesson_completed = true
            }
            const updated = get_lesson_progress.save()
            if (updated) {
                res.status(200)
                    .json({ message: "lesson progress updated successfully", success: true })
            } else {
                res.status(400)
                    .json({ message: "unexpected error occurs", success: false })
            }

        } else {
            const new_lesson_progress = new lesson_progress_model({
                student_id,
                course_id,
                lesson_id,
                video_progress,
                assignment_completed,
                tutorial_completed,
            })
            const created = await new_lesson_progress.save()
            if (created) {
                if (created) {
                    res.status(200)
                        .json({ message: "lesson progress created successfully", success: true })
                } else {
                    res.status(404)
                        .json({ message: "unexpected error occurs", success: false })
                }
            }
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}


const get_lesson_progress = async (req, res) => {
    try {
        const { student_id, course_id } = req.query
        const get_lesson_progress = await lesson_progress_model.find({ student_id, course_id })
        if (get_lesson_progress) {
            res.status(200)
                .json({ message: "lesson progress fetched successfully", success: true, lesson_progress: get_lesson_progress })
        } else {
            res.status(404)
                .json({ message: "Lesson progress not found", success: false })
        }

    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}




export {
    update_video_progress,
    get_video_progress,
    create_lesson_progress,
    update_lesson_progress,
    get_lesson_progress
}