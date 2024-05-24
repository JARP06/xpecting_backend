/**
 * Filename: 		carerRouter.js
 * Description:
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-05-10
 */

//imports
import express from "express";
import { addNewCarer, allCarers, deleteCarer, singleCarer, updateCarer } from "../controllers/carerController.js";

export const carerRouter = express.Router();

//routes
carerRouter.post("/", addNewCarer)   //create carer

carerRouter.get("/", allCarers) // get all carers 
carerRouter.get("/:id", singleCarer) //get single carer

carerRouter.patch("/:id", updateCarer) //update carer
carerRouter.delete("/:id", deleteCarer) //delete carer

