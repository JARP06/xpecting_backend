// Filename: authController.js
// Description: This file contains the necessary code to add users to the system and to perform authentication and authorization to respective parts of the webpage.
// Developed By: Toni-Ann Neil
// Date: 2024-05-14

// Imports
import { pool } from "../database/dbConnection.js";
import JWT from "jsonwebtoken";
import { decryptPW, encryptPW } from "../utils/auth.js";

// JWT AUTH SETUP
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
export let sessionData;

// Sign Up
export async function signup(req, res, _next) {
    const { f_name, l_name, email, phone_num, date_of_birth, due_date, location, password, role = 'User' } = req.body;

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

        // Encrypt password
        const encryptedPassword = await encryptPW(password);

        // Insert user
        const [newUser] = await pool.query(
            `
            INSERT INTO users (f_name, l_name, email, phone_num, date_of_birth, due_date, location, password, role)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [f_name, l_name, email, phone_num, date_of_birth, due_date, location, encryptedPassword, role]
        );

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

// Login
export async function login(req, res, next) {
    const sqlQuery = `
        SELECT * FROM users
        WHERE email = ?
    `;

    const { email, password } = req.body;

    try {
        const [user] = await pool.query(sqlQuery, [email]);

        // Check if user for email entered exists
        if (user.length <= 0) {
            return res.status(401).json({
                status: "INVALID_EMAIL",
                message: "User does not exist.",
            });
        }

        // If user exists, check the password entered against the password from database
        const isUser = await decryptPW(password, user[0].password);

        // If password doesn't match, return an error and a suitable message
        if (!isUser) {
            return res.status(401).json({
                status: "INVALID_PASSWORD",
                message: "Incorrect password",
            });
        }

        // If password matches, create session data and return message to confirm user exists
        const token = signJWTToken(user[0]);

        user[0].password = undefined;

        return res.status(200).json({
            status: "success",
            message: "Login successfully",
            data: {
                token,
                user: user[0],
                expiresIn: process.env.JWT_EXPIRES_IN,
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
}

// Logout
export async function logout(req, res, next) {
    try {
        if (sessionData) {
            req.session.destroy();
            sessionData = undefined;

            res.status(200).json({
                status: "success",
                message: "session destroyed",
            });
        } else {
            res.status(404).json({
                status: "error",
                message: "No user logged in"
            });
        }
    } catch (error) {
        console.log(error);

        res.status(404).json({
            status: "error",
        });
    }
}

// Authentication Middleware
export const isAuthenticated = async (req, res, next) => {
    const authorization = req.get("Authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
        console.log("Authorization header missing or malformed");
        return res.status(400).json({
            status: "error",
            message: "Unauthorized user, please login to view content.",
        });
    }

    const token = authorization.split(" ")[1];

    try {
        const decoded = JWT.verify(token, process.env.JWT_SECRET);
        console.log("Token decoded:", decoded);

        const [users] = await pool.query(
            `SELECT * FROM users WHERE id = ?`,
            [decoded.id]
        );

        if (!users.length) {
            console.log("No user found with this token");
            return res.status(404).json({
                status: "error",
                message: "Token is invalid or error in validation process",
            });
        }

        const user = users[0];
        user.password = undefined; // Remove the password from the user object
        req.user = user;
        console.log("User attached to request:", user);
        next();
    } catch (error) {
        console.error(error);

        let message = "Unknown error";
        if (error.name === "TokenExpiredError") {
            message = "Token expired";
        } else if (error.name === "JsonWebTokenError") {
            message = "Token is invalid";
        }

        return res.status(400).json({
            status: "error",
            message,
        });
    }
};

// Get User Profile
export const getUserProfile = async (req, res, next) => {
    try {
        const data = req.user;
        console.log("================= DATA ===============", data);

        // Ensure you pass the user ID as a parameter to the query
        const [user] = await pool.query(
            `
            SELECT * FROM users
            WHERE id = ?
            `,
            [data.id]
        );

        // Check if user was found
        if (user.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }

        // Remove sensitive data
        user[0].password = undefined;
        console.log(`USER DATA ====> ${user[0]}`);

        // Respond with user data
        res.status(200).json({
            status: "success",
            data: {
                user: user[0],
            },
        });
    } catch (error) {
        console.error("Error fetching user profile:", error);
        res.status(500).json({
            status: "error",
            message: "Internal server error",
        });
    }
};

// Function to reset the password
export const resetPassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const uId = req.params.id;

        // Check if current password matches the one stored in the database
        const [user] = await pool.query(
            `
            SELECT * FROM users
            WHERE id = ?
            `,
            [uId]
        );
        if (!user.length) {
            return res.status(404).json({ error: "error", message: "User not found" });
        }

        // Check if current password is correct
        const isMatch = await decryptPW(currentPassword, user[0].password);
        if (!isMatch) {
            return res.status(400).json({ error: "error", message: "Current password is incorrect" });
        }

        // Update the user's password
        const newPW = await encryptPW(newPassword);
        await pool.query(
            `
            UPDATE users
            SET password = ?
            WHERE id = ?
            `,
            [newPW, uId]
        );

        res.status(200).json({ status: "success", message: "Password updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export default {
    signup,
    login,
    logout,
    isAuthenticated,
    getUserProfile,
    resetPassword,
    sessionData 
};
