import { Request, Response, response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../db";

dotenv.config();

const createHabit = async (habit: {title: string, description: string, user_id: number}) => {
    try 
    {
        const response = await pool.query("INSERT INTO habits (title, description, user_id) VALUES ($1, $2, $3) RETURNING *", [habit.title, habit.description, habit.user_id]);
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
        const {habits} = req.body;
        habits.forEach((habit: {title: string, description: string, user_id: number}) => {
            const response = createHabit(habit);
            if (!response)
            {
                res.status(500).json({error: "The format of the habits are wrong"});
            }
        })

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
        const {user_id} = req.body;
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