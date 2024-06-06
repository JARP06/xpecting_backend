/**
 * Filename: 		appointmentRouter.js
 * Description:
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-05-10
 */

//imports
import express from "express";
import { allAppointments, createAppointment, deleteAppointment, getUpcomingAppointment, singleAppointment, updateAppointment } from "../controllers/appointmentController.js";
import { isAuthenticated } from "../controllers/authController.js";

export const appointmentRouter = express.Router();

// Use authentication middleware for protected routes
// appointmentRouter.use(isAuthenticated);

//routes
appointmentRouter.post("/",isAuthenticated, createAppointment) //create an appointment

appointmentRouter.get("/",isAuthenticated ,allAppointments) //get all appointment for user
appointmentRouter.get("/:id", singleAppointment) //single appointment for user 


appointmentRouter.patch("/:id", updateAppointment) //edit and update appointment 
appointmentRouter.delete("/:id", deleteAppointment) //delete appointment
