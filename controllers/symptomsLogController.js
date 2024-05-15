/**
 * Filename: 		symptomsLogController.js
 * Description:
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-05-10
 */

//import 
import {pool} from "../database/dbConnection.js";


//create a symptom log
 export async function createSymptomLog (req, res, _next) {
    const sqlQuery = `
    INSERT INTO symptom_log(user_id, symptom_id, log_time, severity)
    VALUES(?,?,?,?)
    `;
    try{
        const {user_id, symptom_id, log_time, severity} = req.body;
        const [newSymLog] = await pool.query(sqlQuery,[user_id, symptom_id, log_time, severity]);

        res.status(201).json({
            status: "successful",
            symptomID: newSymLog.insertId
        });
    }catch(error){
        console.log(error);

        res.status(400).json({
            status:"error",
            message: "Failed to log Symptom"
        })
    }
 }

 export async function allSymptomsLogged (req, res, _next){
    const sqlQuery = `
        SELECT sl.*, s.name, u.f_name, u.l_name
        FROM symptom_log sl
        INNER JOIN symptoms s on sl.symptom_id = s.id
        INNER JOIN users u on sl.user_id = u.id 
    `; 
    try{
        const [symptoms_logged] = await pool.query(sqlQuery);

        if (symptoms_logged.length <=0) {
            return res.status(404).json({
                status: "error", 
                message: "No log found"
            })
        }else{
            return res.status(200).json({
                status: "successful", 
                recordCount: symptoms_logged.length, 
                data: symptoms_logged
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

export async function singleLoggedSymptom(req, res, _next) {
    const sqlQuery = `
    SELECT sl.*, s.name, u.f_name, u.l_name
    FROM symptom_log sl
    INNER JOIN symptoms s on sl.symptom_id = s.id
    INNER JOIN users u on sl.user_id = u.id 
    WHERE sl.id = ?
    `;

    const slId = req.params.id;

    try{
        const [symptom_logged] = await pool.query(sqlQuery, slId);
        
        if (symptom_logged.length <= 0) {
            res.status(404).json({
                status: "error",
                message: "Symptom not found",
            });
        }else{
            res.status(200).json({
                status: "successful",
                data: symptom_logged[0],
            });
        }
    }catch (error) {
        console.log(error);

        res.status(404).json({
            status: "error",
            message: "Failed to locate"
        });
    }
}

//update symptoms
export async function updateLoggedSymptom(req, res, _next){
    const sqlQuery = `
    UPDATE symptom_log
    SET symptom_id = ?, log_time = ?, severity = ?
    WHERE id = ?
    `;

    const slId = req.params.id;

    try {
        const {symptom_id, log_time, severity} = req.body;

        const [updateSymptomLogged] = await pool.query(sqlQuery,[symptom_id, log_time, severity, slId]);

        if (updateSymptomLogged.affectedRows <= 0) {
            res.status(404).json({
               status: "error",
               message: "Not Found" 
            })
        }else{
            res.status(200).json({
                status: "successful",
                updateLoggedSymptom: updateSymptomLogged.affectedRows, 
            });
        }
    }catch (error) {
        console.log(error);

        res.status(404).json({
            status: "error",
            message: "Failed to update"
        });
    }
}

//delete logged symptoms 

export async function deleteLoggedSymptom(req, res, _next){
    const sqlQuery = `
    DELETE FROM symptom_log
    WHERE id = ?
    `;
    const slId = req.params.id;
    try{
        const [deleteLog] = await pool.query(sqlQuery,slId);

        if(deleteLog.affectedRows <=0) {
            res.status(404).json({
                status: "error",
                message: "Symptom logged not found"
            });
        }else{
            res.status(200).json({
                status: "successful",
                message: "log deleted"
            });
        }
    }catch(error){
        console.log(error);

        res.status(404).json({
            status: "error",
            message: "Failed to delete symptom logged"
        })
    }
}