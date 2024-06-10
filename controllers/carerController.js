/**
 * Filename: 		carerController.js
 * Description:
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-05-14
 */

//import 
import {pool} from "../database/dbConnection.js";


//create a symptom log
 export async function addNewCarer (req, res, _next) {
    const sqlQuery = `
    INSERT INTO carers (category)
    VALUES(?)
    `;
    try{
        const {category} = req.body;
        const [newSymLog] = await pool.query(sqlQuery,[category]);

        res.status(201).json({
            status: "success",
            symptomID: newSymLog.insertId
        });
    }catch(error){
        

        res.status(400).json({
            status:"error",
            message: "Failed to log Symptom"
        })
    }
 }

 export async function allCarers (req, res, _next){
    const sqlQuery = `
        SELECT * FROM carers
    `; 
    try{
        const [carer] = await pool.query(sqlQuery);

        if (carer.length <=0) {
            return res.status(404).json({
                status: "error", 
                message: "No log found"
            })
        }else{
            return res.status(200).json({
                status: "success", 
                recordCount: carer.length, 
                data: carer
            });
        }
    }catch(error) {
        console.error(error);

        return res.status(500).json({
            status:"error", 
            message: "Failed to retrieve log"
        })

    }
 }

//get single symptom logged 

export async function singleCarer(req, res, _next) {
    const sqlQuery = `
    SELECT * FROM carers 
    WHERE id = ?
    `;

    const cId = req.params.id;

    try{
        const [oneCarer] = await pool.query(sqlQuery, cId);
        
        if (oneCarer.length <= 0) {
            res.status(404).json({
                status: "error",
                message: "Symptom not found",
            });
        }else{
            res.status(200).json({
                status: "success",
                data: oneCarer[0],
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
export async function updateCarer(req, res, _next){
    const sqlQuery = `
    UPDATE carers
    SET category = ?
    WHERE id = ?
    `;

    const cId = req.params.id;

    try {
        const {category} = req.body;

        const [updateACarer] = await pool.query(sqlQuery,[category, cId]);

        if (updateACarer.affectedRows <= 0) {
            res.status(404).json({
               status: "error",
               message: "Not Found" 
            })
        }else{
            res.status(200).json({
                status: "success",
                updateLoggedSymptom: updateACarer.affectedRows, 
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

export async function deleteCarer(req, res, _next){
    const sqlQuery = `
    DELETE FROM carers
    WHERE id = ?
    `;
    const cId = req.params.id;
    try{
        const [deleteACarer] = await pool.query(sqlQuery, cId);

        if(deleteACarer.affectedRows <= 0) {
            res.status(404).json({
                status: "error",
                message: "Carer not found"
            });
        } else { 
            res.status(200).json({
                status: "success",
                message: "Carer deleted"
            });
        }
    } catch(error) {
        

        res.status(404).json({
            status: "error",
            message: "Failed to delete carer"
        })
    }
}
