/**
 * Filename: 		appointmentRouter.js
 * Description:
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-05-10
 */

//imports
import express from "express";
import { allAppointments, createAppointment, deleteAppointment, singleAppointment, updateAppointment } from "../controllers/appointmentController.js";

export const appointmentRouter = express.Router();

//routes
appointmentRouter.post("/", createAppointment) //create an appointment

appointmentRouter.get("/", allAppointments) //get all appointment for user
appointmentRouter.get("/:id", singleAppointment) //single appointment for user 


appointmentRouter.patch("/:id", updateAppointment) //edit and update appointment 
appointmentRouter.delete("/:id", deleteAppointment) //delete appointment
