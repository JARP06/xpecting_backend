/**
 * Filename: 		auth.js
 * Description:     This module provides functions for password encryption, decryption, and route protection.
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-05-20
 */

// Imports
import bcrypt from "bcryptjs";
import { sessionData } from "../controllers/authController.js";

/**
 * Encrypts a password using bcrypt.
 * @param {string} password - The plain text password to encrypt.
 * @returns {Promise<string>} - The encrypted password.
 */
export async function encryptPW(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

/**
 * Compares a plain text password with an encrypted password.
 * @param {string} password - The plain text password.
 * @param {string} encryptedPW - The encrypted password.
 * @returns {Promise<boolean>} - True if the passwords match, false otherwise.
 */
export async function decryptPW(password, encryptedPW) {
    try {
        
        
        
        
        // Ensure both password and encryptedPW are defined
        if (!password || !encryptedPW) {
            throw new Error("Invalid input parameters");
        }

        // Compare passwords using bcrypt.compare
        const result = await bcrypt.compare(password, encryptedPW);
        return result;
    } catch (error) {
        console.error("Error decrypting password:", error);
        return false; // Return false or handle the error accordingly
    }
}


/**
 * Middleware to protect routes by checking if the user is authenticated.
 * @param {object} req - The request object.
 * @param {object} res - The response object.
 * @param {function} next - The next middleware function.
 */
export const authentication = (req, res, next) => {
    if (sessionData) {
        next();
    } else {
        res.status(401).json({
            status: "error",
            message: "Invalid User"
        });
    }
};
