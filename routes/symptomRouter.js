/**
 * Filename: 		symptomRouter.js
 * Description:
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-05-10
 */

//imports
import express from "express";
import { addNewSymptom, allSymptoms, deleteSymptom, singleSymptom, updateSymptom } from "../controllers/symptomController.js";

export const symptomRouter = express.Router();

//routes
symptomRouter.post("/", addNewSymptom)   //create symptom

symptomRouter.get("/", allSymptoms) // get all carers 
symptomRouter.get("/:id", singleSymptom) //get single symptom

symptomRouter.patch("/:id", updateSymptom) //update symptom
symptomRouter.delete("/:id", deleteSymptom) //delete symptom

