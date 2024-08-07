import { Request, Response, response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../db";

dotenv.config();

// function countDaysBetweenDates(dateStr1:string, dateStr2:string):number {
//     // Parse the dates in DD-MM-YYYY format
//     let [day1, month1, year1] = dateStr1.split('-').map(Number);
//     let [day2, month2, year2] = dateStr2.split('-').map(Number);

//     // Create Date objects (months are 0-indexed in JavaScript Date)
//     let date1:Date = new Date(year1, month1 - 1, day1);
//     let date2:Date = new Date(year2, month2 - 1, day2);

//     // Calculate the difference in milliseconds
//     let differenceMs = Math.abs(date2 - date1);

//     // Convert milliseconds to days
//     let differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));

//     return differenceDays;
// }

function countDaysBetweenDates(dateStr1: string, dateStr2: string): number {
  // Parse the dates in MM-DD-YYYY format
  const [month1, day1, year1] = dateStr1.split("-").map(Number);
  const [month2, day2, year2] = dateStr2.split("-").map(Number);

  // Create Date objects (months are 0-indexed in JavaScript Date)
  const date1: Date = new Date(year1, month1 - 1, day1);
  const date2: Date = new Date(year2, month2 - 1, day2);

  // Calculate the difference in milliseconds
  const differenceMs: number = Math.abs(date2.getTime() - date1.getTime());

  // Convert milliseconds to days
  const differenceDays: number = Math.ceil(
    differenceMs / (1000 * 60 * 60 * 24)
  );

  return differenceDays;
}

export const startNewDay = async (req: Request, res: Response) => {
  const today = new Date().toLocaleDateString("en-US").split("/").join("-");

  const daysResponse = await pool.query("SELECT * FROM days");
  const formattedLastDay = new Date(
    daysResponse.rows[daysResponse.rows.length - 1]
  )
    .toLocaleDateString("en-US")
    .split("/")
    .join("-");

  const diff = countDaysBetweenDates(today, formattedLastDay);

  if (diff) {
    try {
      const someVariable = await pool.query(
        "SELECT * FROM user_date_habits WHERE date_id = $1",
        [daysResponse.rows[daysResponse.rows.length - 1].date_id]
      );
      await pool.query(
        "INSERT INTO user_date_habits (user_id, date_id, habit_id)"
      );
    } catch (error) {
      console.log(JSON.stringify(error));
    }
  }
};

export const saveRecord = async (req: Request, res: Response) => {
  const { record_date, user_input, ai_output } = req.body;

  try {
    const response = await pool.query(
      "INSERT INTO daily_records (record_date, user_input, ai_output) VALUES ($1, $2, $3) RETURNING *",
      [record_date, user_input, ai_output]
    );

    res.status(200).json(response.rows);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error happened while saving the record" });
  }
};

export const checkIfRatingExists = async (req: Request, res: Response) => {
  const { date } = req.query;
  const { user_id } = req.query;
  try {
    const response = await pool.query(
      "SELECT * FROM habit_ratings WHERE date=$1 AND user_id=$2",
      [date, user_id]
    );
    res.status(200).json(response.rows);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "error while checking if rating with date exists" });
  }
};

export const getRecord = async (req: Request, res: Response) => {
  const { date } = req.query;
  try {
    const response = await pool.query(
      "SELECT * FROM daily_records WHERE record_date=$1",
      [date]
    );
    res.status(200).json(response.rows);
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Error while getting the record for given date" });
  }
};
