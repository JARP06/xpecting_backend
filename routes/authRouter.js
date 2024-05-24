/**
 * Filename: 		authRouter.js
 * Description:     This file contains the necessary code to add users to the system and to perform authentication and authorization to respective parts of the webpage.
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-04-24
 */

// Import necessary modules
import express from "express";
import { getUserProfile, isAuthenticated, login, logout, resetPassword, signup } from "../controllers/authController.js";
import { getMostRecentLoggedSymptom } from "../controllers/symptomsLogController.js";

// Create a new router
export const authRouter = express.Router();

// Define routes
authRouter.route("/signup").post(signup); // Signup a user
authRouter.route("/").post(login); // Login a user
authRouter.route("/logout").get(logout); // Logout a user

// Use authentication middleware for protected routes
authRouter.use(isAuthenticated);

// Define authenticated routes
authRouter.get("/user-data", getUserProfile); // Get current user profile
authRouter.patch("/reset-password/:id", resetPassword); // Reset password for a user

