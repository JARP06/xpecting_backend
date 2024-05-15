/**
 * Filename: 		symptomsLogRouter.js
 * Description:
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-05-10
 */

//imports
import express from "express";
import { allSymptomsLogged, createSymptomLog, deleteLoggedSymptom, singleLoggedSymptom, updateLoggedSymptom } from "../controllers/symptomsLogController.js";

export const symptomsLogRouter = express.Router();

//routes
symptomsLogRouter.post("/", createSymptomLog)   //create symptom log

symptomsLogRouter.get("/", allSymptomsLogged) // get all symptoms 
symptomsLogRouter.get("/:id", singleLoggedSymptom) //get single symptom

symptomsLogRouter.patch("/:id", updateLoggedSymptom) //update symptom log
symptomsLogRouter.delete("/:id", deleteLoggedSymptom) //delete symptom log

