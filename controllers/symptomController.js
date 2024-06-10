/**
 * Filename: 		symptomController.js
 * Description:
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-05-14
 */

//import 
import {pool} from "../database/dbConnection.js";


//create a symptom 
 export async function addNewSymptom (req, res, _next) {
    const sqlQuery = `
    INSERT INTO symptoms (name)
    VALUES(?)
    `;
    try{
        const {name} = req.body;
        const [newSymLog] = await pool.query(sqlQuery,[name]);

        res.status(201).json({
            status: "success",
            symptomID: newSymLog.insertId
        });
    }catch(error){
        

        res.status(400).json({
            status:"error",
            message: "Failed to add Symptom"
        })
    }
 }

 export async function allSymptoms (req, res, _next){
    const sqlQuery = `
        SELECT * FROM symptoms
    `; 
    try{
        const [symptom] = await pool.query(sqlQuery);

        if (symptom.length <=0) {
            return res.status(404).json({
                status: "error", 
                message: "No symptom found"
            })
        }else{
            return res.status(200).json({
                status: "success", 
                recordCount: symptom.length, 
                data: symptom
            });
        }
    }catch(error) {
        console.error(error);

        return res.status(500).json({
            status:"error", 
            message: "Failed to retrieve symptom"
        })

    }
 }

//get single symptom  

export async function singleSymptom(req, res, _next) {
    const sqlQuery = `
    SELECT * FROM symptoms 
    WHERE id = ?
    `;

    const sId = req.params.id;

    try{
        const [oneSymptom] = await pool.query(sqlQuery, sId);
        
        if (oneSymptom.length <= 0) {
            res.status(404).json({
                status: "error",
                message: "Symptom not found",
            });
        }else{
            res.status(200).json({
                status: "success",
                data: oneSymptom[0],
            });
        }
    }catch (error) {
        

        res.status(404).json({
            status: "error",
            message: "Failed to locate"
        });
    }
}

//update symptoms
export async function updateSymptom(req, res, _next){
    const sqlQuery = `
    UPDATE symptoms
    SET name = ?
    WHERE id = ?
    `;

    const sId = req.params.id;

    try {
        const {name} = req.body;

        const [updateASymptom] = await pool.query(sqlQuery,[name, sId]);

        if (updateASymptom.affectedRows <= 0) {
            res.status(404).json({
               status: "error",
               message: "Not Found" 
            })
        }else{
            res.status(200).json({
                status: "success",
                updateLoggedSymptom: updateASymptom.affectedRows, 
            });
        }
    }catch (error) {
        

        res.status(404).json({
            status: "error",
            message: "Failed to update"
        });
    }
}

//delete logged symptoms 

export async function deleteSymptom(req, res, _next){
    const sqlQuery = `
    DELETE FROM symptoms
    WHERE id = ?
    `;
    const sId = req.params.id;
    try{
        const [deleteASymptom] = await pool.query(sqlQuery, sId);

        if(deleteASymptom.affectedRows <= 0) {
            res.status(404).json({
                status: "error",
                message: "symptom not found"
            });
        } else { 
            res.status(200).json({
                status: "success",
                message: "symptom deleted"
            });
        }
    } catch(error) {
        

        res.status(404).json({
            status: "error",
            message: "Failed to delete symptom"
        })
    }
}
