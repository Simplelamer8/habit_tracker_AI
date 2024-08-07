import { Request, Response, response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../db";

dotenv.config();

const checkIfHabitExists = async (
  habit: {
    title: string;
    description: string;
    goal: string;
    time_frame: number;
  },
  user_id: number
) => {
  const response = await pool.query(
    "SELECT * FROM habits WHERE user_id=$1 AND title=$2",
    [user_id, habit.title]
  );
  if (response.rows.length) {
    return true;
  }
  return false;
};

const createHabit = async (
  habit: {
    title: string;
    description: string;
    goal: string;
    time_frame: number;
  },
  user_id: number
) => {
  try {
    const response = await pool.query(
      "INSERT INTO habits (title, description, user_id, goal, time_frame) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [habit.title, habit.description, user_id, habit.goal, habit.time_frame]
    );
    return response;
  } catch (error) {
    return null;
  }
};

export const createHabits = async (req: Request, res: Response) => {
  try {
    const { habits, user_id } = req.body;
    for (const habit of habits) {
      const exists = await checkIfHabitExists(habit, user_id);
      if (exists) {
        continue;
      }
      const response = createHabit(habit, user_id);
      if (!response) {
        res.status(500).json({ error: "The format of the habits are wrong" });
      }
    }

    // habits.forEach((habit: {title: string, description: string, goal: string, time_frame: number}) => {
    //     const exists = await checkIfHabitExists(habit, user_id);
    //     if (exists)
    //     {
    //         continue;
    //     }
    //     const response = createHabit(habit, user_id);
    //     if (!response)
    //     {
    //         res.status(500).json({error: "The format of the habits are wrong"});
    //     }
    // })

    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({ message: "Error while creating habits" });
  }
};

export const getHabits = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;
    if (!user_id) {
      return res.status(400).json({ message: "Missing user_id parameter" });
    }
    const response = await pool.query(
      "SELECT * FROM habits WHERE user_id = $1",
      [user_id]
    );

    const habits = response.rows;

    res.status(200).json(habits);
  } catch (error) {
    res.status(500).json({ message: "Error while fetching habits" });
  }
};

export const removeHabit = async (req: Request, res: Response) => {
  try {
    const { habit_id } = req.body;
    const response = await pool.query(
      "DELETE FROM habits WHERE habit_id = $1",
      [habit_id]
    );

    res.status(200).json({ message: "The habit is removed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error while deleting a habit" });
  }
};

export const rateHabit = async (req: Request, res: Response) => {
  try {
    const { user_id, date, rating, habitName } = req.body;
    const response_getID = await pool.query(
      "SELECT * FROM habits WHERE title = $1 AND user_id = $2",
      [habitName, user_id]
    );
    if (response_getID.rows.length === 0) {
      return res.status(404).json({ message: "Habit not found" });
    }

    const { habit_id } = response_getID.rows[0];

    console.log(
      `about to insert into db... habit_id: ${habit_id}, user_id: ${user_id}, date: ${date}, rating: ${rating}, habitName: ${habitName}`
    );

    const response_checkExisting = await pool.query(
      "SELECT * FROM habit_ratings WHERE user_id = $1 AND habit_id = $2 AND date = $3",
      [user_id, habit_id, date]
    );

    let response;
    if (response_checkExisting.rows.length > 0) {
      // Update existing rating
      response = await pool.query(
        "UPDATE habit_ratings SET rating = $1 WHERE user_id = $2 AND habit_id = $3 AND date = $4 RETURNING *",
        [rating, user_id, habit_id, date]
      );
    } else {
      // Insert new rating
      response = await pool.query(
        "INSERT INTO habit_ratings (user_id, habit_id, date, rating) VALUES ($1, $2, $3, $4) RETURNING *",
        [user_id, habit_id, date, rating]
      );
    }

    console.log("after inserting/updating in DB");
    res.status(200).json(response.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error while rating and saving a habit" });
  }
};

export const getAverageRating = async (req: Request, res: Response) => {
  try {
    const { user_id } = req.query;
    const response = await pool.query("SELECT * FROM habits WHERE user_id=$1", [
      user_id,
    ]);
    const { habit_id } = response.rows[0];
    const response_ratings = await pool.query(
      "SELECT * FROM habit_ratings WHERE habit_id=$1",
      [habit_id]
    );
    const rating_arr = response_ratings.rows.slice(-66);
    let result = 0;
    console.log(rating_arr);
    for (const rating_obj of rating_arr) {
      result += rating_obj.rating;
    }
    if (rating_arr.length < 66) {
      res.status(200).json(result / rating_arr.length);
    } else {
      res.status(200).json(result / 66);
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error while getting average rating of the habit" });
  }
};
