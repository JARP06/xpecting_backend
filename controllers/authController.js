/**
 * Filename: 		authController.js
 * Description:     This file contains the necessary code to add users to the system and to perform authentication and authorization to respective parts of the webpage.
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-05-14
 */

//imports
import { cryptoRandomStringAsync } from "crypto-random-string";
import {pool} from "../database/dbConnection.js";
import JWT from "jsonwebtoken";
import { decryptPW } from "../utils/auth.js";

const randomString = await cryptoRandomStringAsync({ length:62, type:"alphanumeric" });
console.log(randomString);

//JWT AUTH SETUP
/**
 * create the json web token when a user register
 * @param {*} user
 * @returns
 */
const signJWTToken = (user) => {
    return JWT.sign(
        {
            id: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN,
        },
    );
};
//JWT set up for auth

export let sessionData;

//signup
export async function signup(req, res, _next) {
    const { f_name, l_name, email, phone_num, date_of_birth, due_date, location, password, role } = req.body;

    try {
        // Check if user already exists
        const [ifUserExist] = await pool.query(
            `
            SELECT CASE WHEN COUNT(*) > 0 THEN 'true' ELSE 'false' END as ifUserExist
            FROM users
            WHERE email = ?
            `,
            [email]
        );

        if (ifUserExist[0].ifUserExist === "true") {
            return res.status(400).json({
                status: "error",
                message: "User already signed up with this email",
            });
        }

        // Insert user
        const [newUser] = await pool.query(
            `
            INSERT INTO users (f_name, l_name, email, phone_num, date_of_birth, due_date, location, password, role)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [f_name, l_name, email, phone_num, date_of_birth, due_date, location, password, role]
        );

        if (newUser.insertId) {
            // Check if user is admin or regular user
            const [checkAdminOrUser] = await pool.query(
                `
                SELECT 'admin' AS accType FROM users WHERE role = 'admin'
                UNION
                SELECT 'user' AS accType FROM users WHERE role = 'user'
                `
            );

            // Handle admin or user check result
            // You may want to do something with this result
            console.log(checkAdminOrUser);
        }

        // Respond with success message
        res.status(200).json({
            status: "success",
            message: "User signed up successfully",
        });
    } catch (error) {
        console.error("Error in signup:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
}
//login
export async function login(req, res, next){
    const sqlQuery = `
    SELECT * FROM users
    WHERE email = ?
    `;

    const { email,pw}=req.body;

    const [user] = await pool.query(sqlQuery, [email]);

    if (user.length <=0){

        res.status(401).json({
            status: "INVALID_EMAIL",
            message: "User does not exist",
        });
    }else{
        const isUser = await decryptPW(pw, user[0].password);

        if (!isUser){
            res.status(401).json({
                status:"INVALID_PASSWORD",
                message: "Incorrect Password",
            });
        }else{
            const token = signJWTToken(user[0]);

            user[0].password = undefined;

            res.status(200).json({
                status: "success",
                message: "Login successful",
                data:{
                    token,
                    user:user[0],
                    expiresIn: process.env.JWT_EXPIRES_IN,
                }
            });
        }
    }
}