import {Request, Response} from "express";
import { authMiddleware, loginUser, refreshToken, registerUser } from "./auth/auth";
import express from 'express'
import { createHabits, getHabits, removeHabit } from "./habits/habits";
import cors from "cors";
// import { getPlan, sendPrompt } from "./ai/ai";
// import { callListOutputParser, callStringOutputParser, callStructuredParser } from "./ai/output-parsers";
// import { getContextResposne } from "./ai/retrieval-chain";

const PORT = process.env.PORT || 8080;

const app = express();
app.use(express.json());
app.use(cors());

// getContextResposne();

app.post("/register", registerUser);
app.post("/login", loginUser);
app.post("/refresh_token", refreshToken);

app.post("/create_habits",  authMiddleware, createHabits);
app.get("/get_habits",  authMiddleware, getHabits);
app.post("/remove_habit", removeHabit);

// app.post("/get_plan", getPlan);
// app.post("/send_prompt", sendPrompt);

app.listen(PORT, () => {
    console.log("Server is launched on the port: ", PORT);
})