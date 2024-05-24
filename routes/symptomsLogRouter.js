/**
 * Filename: 		symptomsLogRouter.js
 * Description:
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-05-10
 */

//imports
import express from "express";
import { allSymptomsLogged, createSymptomLog, deleteLoggedSymptom, getMostRecentLoggedSymptom, singleLoggedSymptom, updateLoggedSymptom } from "../controllers/symptomsLogController.js";
import { isAuthenticated } from "../controllers/authController.js";

export const symptomsLogRouter = express.Router();

//routes
symptomsLogRouter.post('/symptoms/log', isAuthenticated, createSymptomLog);
symptomsLogRouter.get('/symptoms/log', isAuthenticated, allSymptomsLogged);
symptomsLogRouter.get('/symptoms/log/:id', isAuthenticated, singleLoggedSymptom);
symptomsLogRouter.put('/symptoms/log/:id', isAuthenticated, updateLoggedSymptom);
symptomsLogRouter.delete('/symptoms/log/:id', isAuthenticated, deleteLoggedSymptom);
symptomsLogRouter.get('/symptoms/most-recent', isAuthenticated, getMostRecentLoggedSymptom);

