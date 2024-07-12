// import { Request, Response } from "express";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import dotenv from "dotenv";
// import pool from "../db";

// dotenv.config();

// let model = null;

// if (process.env.GOOGLE_API_KEY)
// {
//     const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
//     const generationConfig = {temperature: 0.9, topP: 1, topK: 1, maxOutputTokens: 4096};

//     model = genAI.getGenerativeModel({model: "gemini-pro", generationConfig});
// }

// export const getPlan = async (req: Request, res: Response) => {
//     const {context, goal, user_id} = req.body;
//     const persona = "You have considerable experience in developing and maintaining habits. Additionally you have a knowledge base of Andrew Huberman, James Clear and other experts in the field of developing habits and breaking the bad ones";
//     const task = "I want you to divide my end goal into smaller ones that could be tracked in a week.";
//     const exemplar = "For instance I am asking you to develop a gym training program for me to gain 5kg muscle mass withing 2 months. I need you to respond me with json format like: {advice: 'To gain muscle mass you need to target the entire body. Make sure that you are training until failure and doing 8-12 reps. For chest and triceps try to do Bench press, French press. To train back and biceps do horizontal rows and biceps curls. For legs you need to do leg extensions.', program:[{week: 1, goal: 'Record the weight for each exercise that you make 8-12 reps until failure' }, {week: 2, goal: 'Another descriptive goal'}, (Fill the array up until 2nd month)]}";
//     if (!model)
//     {
//         res.status(500).json({message: "Gemini is not active."});
//     }
//     try 
//     {
//         const result = await model?.generateContent(persona + context + goal + task + exemplar);
//         const response = await result?.response;

//         if (!response || !response.candidates || response.candidates.length === 0)
//         {
//             return res.status(500).json({message: "No response"});   
//         }

//         const dialog = "user prompt:" + persona + context + goal + task + exemplar + '\n' + "AI:" + response.candidates[0].content.parts[0].text;

//         // console.log("before inserting into history");
//         await pool.query("INSERT INTO history (user_id, conversation) VALUES ($1, $2)", [user_id, dialog]);

//         // console.log("After inserting into history");

//         res.status(200).json(response.candidates[0].content.parts[0].text);
//     }
//     catch(error)
//     {
//         console.log(JSON.stringify(error));
//         res.status(500).json(error);
//     }
// } 

// /*
// {
//     "context": "I am complete beginner into programming",
//     "goal": "I want to become a Python backend developer within a 3 months",
//     "user_id": 1
// }

// {
//     "prompt": "I am struggling to achieve the goal of the second week and feel really depressed. Give me advice on further actions based on the context of our conversation",
//     "user_id": 1
// }
// */

// export const sendPrompt = async (req: Request, res: Response) => {
//     const {prompt, user_id} = req.body;

//     if (!model)
//     {
//         res.status(500).json({message: "Gemini is not active."});
//     }

//     try
//     {
//         const response = await pool.query("SELECT * FROM history WHERE user_id=$1", [user_id]);
//         console.log(JSON.stringify(response.rows[0].conversation));



//         const result = (await model?.generateContent("Previous conversation context:" + JSON.stringify(response.rows[0].conversation) + "prompt:" + prompt));

//         const responseAI = result?.response;
        


//         if (!responseAI || !responseAI.candidates || responseAI.candidates.length === 0)
//         {
//             return res.status(500).json({message: "No response"});   
//         }

//         const dialog = "Previous conversation context:" + JSON.stringify(response.rows[0].conversation) + "user prompt:" + prompt + '\n' + "AI:" + responseAI.candidates[0].content.parts[0].text;
//         console.log(JSON.stringify(dialog));

//         await pool.query("UPDATE history SET conversation=$1 WHERE user_id=$2", [dialog, user_id]);

//         res.status(200).json(responseAI.candidates[0].content.parts[0].text);
//     }
//     catch(error)
//     {
//         console.log(JSON.stringify(error));
//         res.status(500).json(error);
//     }
// }