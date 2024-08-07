import { Request, Response } from "express";
import {
  authMiddleware,
  loginUser,
  refreshToken,
  registerUser,
} from "./auth/auth";
import express from "express";
import {
  createHabits,
  getAverageRating,
  getHabits,
  rateHabit,
  removeHabit,
} from "./habits/habits";
import cors from "cors";
import { checkIfRatingExists, getRecord, saveRecord } from "./dates/dates";
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

app.post("/create_habits", createHabits);
app.get("/get_habits", getHabits);
app.post("/remove_habit", removeHabit);
app.post("/rate_habit", rateHabit);
app.post("/save_record", saveRecord);

app.get("/rating_exists", checkIfRatingExists);
app.get("/get_record", getRecord);

app.get("/get_average_rating", getAverageRating);

// app.post("/get_plan", getPlan);
// app.post("/send_prompt", sendPrompt);

app.listen(PORT, () => {
  console.log("Server is launched on the port: ", PORT);
});
