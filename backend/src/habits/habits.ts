import { Request, Response, response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../db";

dotenv.config();

const checkIfHabitExists = async(habit: {title: string, description: string, goal: string, time_frame: number}, user_id:number) => {
    const response = await pool.query("SELECT * FROM habits WHERE user_id=$1 AND title=$2", [user_id, habit.title]);
    if (response.rows.length)
    {
        return true;
    }
    return false;
}

const createHabit = async (habit: {title: string, description: string, goal: string, time_frame: number}, user_id:number) => {
    try 
    {
        const response = await pool.query("INSERT INTO habits (title, description, user_id, goal, time_frame) VALUES ($1, $2, $3, $4, $5) RETURNING *", [habit.title, habit.description, user_id, habit.goal, habit.time_frame]);
        return response;
    }
    catch(error)
    {
        return null;
    }
}

export const createHabits = async (req: Request, res: Response) => {
    try
    {
        const {habits, user_id} = req.body;
        for (const habit of habits)
        {
            const exists = await checkIfHabitExists(habit, user_id);
            if (exists)
            {
                continue;
            }
            const response = createHabit(habit, user_id);
            if (!response)
            {
                res.status(500).json({error: "The format of the habits are wrong"});
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
    }
    catch(error)
    {
        res.status(500).json({message: "Error while creating habits"});
    }

}

export const getHabits = async (req: Request, res: Response) => {
    try 
    {
        const {user_id} = req.query;
        if (!user_id)
        {
            return res.status(400).json({ message: "Missing user_id parameter" });
        }
        const response = await pool.query("SELECT * FROM habits WHERE user_id = $1", [user_id]);

        const habits = response.rows;

        res.status(200).json(habits);

    }
    catch(error)
    {
        res.status(500).json({message: "Error while fetching habits"});
    }
}

export const removeHabit = async (req: Request, res: Response) => {
    try
    {
        const {habit_id} = req.body;
        const response = await pool.query("DELETE FROM habits WHERE habit_id = $1", [habit_id]);

        res.status(200).json({message: "The habit is removed successfully"});
    }
    catch(error)
    {
        res.status(500).json({message: "Error while deleting a habit"});
    }
}