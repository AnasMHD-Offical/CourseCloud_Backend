import { GoogleGenerativeAI } from "@google/generative-ai"
import quiz_progress_model from "../models/quiz_progress.js";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash", generationConfig: {
        responseMimeType: "application/json",
    },
});


async function generate(topic, prompt) {
    const default_prompt = `${topic ? topic : "Introduction to html,css,js"} : Create 10 mcq questions based on the topic within an object without any bold and text styling`;
    const result = await model.generateContent(prompt ? prompt : default_prompt);
    // console.log(result.response.text());
    let Qns = result.response.text()
    console.log(Qns);
    return result.response.text()
}

//
const get_quizzes = async (req, res) => {
    try {
        const topic = req.query.topic
        console.log("topic : ", topic);
        const prompt = `
        Task: Generate a quiz with questions categorized into three difficulty levels: Easy, Medium, and Hard.  
        Topic: ${topic || "This lesson is about the basics of javascript"}  

        Requirements:  
        7. don't include any comments which include "//"
        8. Give the data in json format which would able to render in a react component
        1. Provide exactly 10 questions for each difficulty level (Easy, Medium, Hard), resulting in a total of 30 questions.  
        2. Each question should have:  
           - A clear and concise question text.  
           - Four multiple-choice options labeled A, B, C, D.  
           - The correct answer marked.  
           - A brief explanation for the correct answer (optional for Easy questions, mandatory for Medium and Hard questions).  
        3. Ensure the difficulty scaling aligns with the following:  
           - Easy: Basic understanding or recall of facts.  
           - Medium: Application of knowledge or moderate reasoning.  
           - Hard: Advanced reasoning, critical thinking, or deep understanding of the topic.  
        4. The output should be in a javascript object for use it to descructure 
        5. Don't add any bold and text styles to the output to highlight
        6. No headings or caption wanted related to the topic along with the response
       Output Format:  
        Return the response as a JavaScript object with the following structure:  


                {
                    "easy": [
                        {
                            "question": "Question text",
                            "options": [
                                "Option 1",
                                "Option 2",
                                "Option 3",
                                "Option 4"
                            ],
                            "correctAnswer": 0
                        }
                    ],
                        "medium": [
                            {
                                "question": "Question text",
                                "options": [
                                    "Option 1",
                                    "Option 2",
                                    "Option 3",
                                    "Option 4"
                                ],
                                "correctAnswer": 3,
                                "explanation": "Explanation text"
                            }
                        ],
                            "hard": [
                                {
                                    "question": "Question text",
                                    "options": [
                                        "Option 1",
                                        "Option 2",
                                        "Option 3",
                                        "Option 4"
                                    ],
                                    "correctAnswer": 2,
                                    "explanation": "Explanation text"
                                }
                            ]
                }

        Note: The total number of questions will be 30, divided as follows:  
        - 10 Easy questions  
        - 10 Medium questions  
        - 10 Hard questions  

        
        
        `

        const get_quizzes = await generate(topic, prompt)
        // const refinedQuizes = JSON.parse(get_quizzes)
        // console.log(JSON.parse(get_quizzes));

        if (get_quizzes) {
            res.status(200)
                .json({ message: "quizzes fetched successfully", success: true, quizzes: get_quizzes })
        } else {
            res.status(400)
                .json({ message: "Unexpected error occurs. Try again", success: false })
        }
    } catch (error) {
        res.status(500)
            .json({ message: "Something went Wrong", success: false, error: error.message })
    }
}



const store_results = async (req, res) => {
    try {
        console.log(req.body);

        const { student_id, course_id, lesson_id, total_score, student_scored, time_taken, difficulty } = req.body
        const new_quiz_result = new quiz_progress_model({
            student_id: student_id,
            course_id: course_id,
            lesson_id: lesson_id,
            total_score: total_score,
            student_scored: student_scored,
            time_taken: time_taken,
            difficulty: difficulty

        })
        const Added_progress = await new_quiz_result.save()
        if (Added_progress) {
            res.status(200)
                .json({ message: "quiz progress stored successfully", success: true })
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
    get_quizzes,
    store_results,
}