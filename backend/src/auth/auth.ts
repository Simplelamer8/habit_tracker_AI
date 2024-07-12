import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../db";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET;

if (!jwtSecret || !jwtRefreshSecret) {
    console.log(JSON.stringify(jwtSecret), JSON.stringify(jwtRefreshSecret));
    throw new Error('JWT_SECRET environment variable is not defined');
}

export const registerUser = async(req: Request, res:Response) => {
    try
    {
        const {email, password} = req.body;
        const hashed_password = await bcrypt.hash(password, 10);
        const newUser = await pool.query("INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *", [email, hashed_password]);
        // console.log("After operation with DB...");
        res.status(201).json(newUser.rows[0]);
    }
    catch(error)
    {
        res.status(500).send(error);
    }
}

const generateAccessToken = (user: {email: string, password: string, user_id: string}) => {
    return jwt.sign({id: user.user_id, email: user.email}, jwtSecret, {expiresIn: '15m'})
}

const generateRefreshToken = (user: {email: string, password: string, user_id: string}) => {
    return jwt.sign({id: user.user_id, email: user.email}, jwtRefreshSecret, {expiresIn: '15m'})
}

export const loginUser = async (req: Request, res: Response) => {
    try 
    {
        const {email, password} = req.body;
        // console.log("before userREsponse");
        const userResponse = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

        if (userResponse.rows.length === 0)
        {
            return res.status(404).json({error: "User not found"});
        }

        const user = userResponse.rows[0];

        // console.log("Before password comparison");
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch)
        {
            return res.status(400).json({error: "Invalid email or password"});
        }
        
        console.log("Token generation...");

        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        await pool.query("INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)", [refreshToken, user.user_id]);

        res.status(200).json({message: "Login successful", email: user.email, accessToken, refreshToken, user_id: user.user_id});
    }
    catch(error)
    {
        console.log(error)
        res.status(500).send("Internal server error");
    }
}

const verifyJwt = (token: string):any => {
    try
    {
        return jwt.verify(token, jwtSecret);
    }
    catch(error)
    {
        return null;
    }
}

const verifyRefreshToken = (token: string):any => {
    try
    {
        return jwt.verify(token, jwtRefreshSecret);
    }
    catch(error)
    {
        return null;
    }
}

export const refreshToken = async(req: Request, res: Response) => {
    const {oldToken} = req.body;

    const payload = verifyRefreshToken(oldToken);
    if (!payload)
    {
        return null;
    }

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [payload.id]);
    const user = result.rows[0];

    if (!user)
    {
        res.status(404).json({message: "User not found"});
    }

    const newAccessToken = jwt.sign({user_id: user.user_id, email: user.email}, jwtSecret, {expiresIn: '15m'});
    const newRefreshToken = jwt.sign({user_id: user.user_id, email: user.email}, jwtRefreshSecret, {expiresIn: '7d'});

    await pool.query("INSERT INTO refresh_tokens (token, user_id) VALUES ($1, $2)", [newRefreshToken, user.user_id]);
    await pool.query("DELETE FROM refresh_tokens WHERE token=$1", [oldToken]);

    res.status(200).json({accessToken: newAccessToken, refreshToken: newRefreshToken});
}


export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer "))
    {
        return res.status(401).json({message: "Unauthorized"});
    }

    const token = authHeader.split(' ')[1];

    try
    {
        const decoded = verifyJwt(token);
        (req as any).user = decoded;
        next();
    }
    catch(error)
    {
        res.status(401).json({message: "Unauthorized"});
    }

}