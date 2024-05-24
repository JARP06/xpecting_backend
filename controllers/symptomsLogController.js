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
            status: "success",
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

 export async function allSymptomsLogged(req, res, _next) {
    // Assuming logged-in user ID is stored in req.user.id
    const loggedInUserId = req.user.id;
    const { userId } = req.params; // Get the userId from the request parameters

    const sqlQuery = `
        SELECT sl.*, s.name, u.f_name, u.l_name
        FROM symptom_log sl
        INNER JOIN symptoms s ON sl.symptom_id = s.id
        INNER JOIN users u ON sl.user_id = u.id
        WHERE sl.user_id = ? AND u.id = ? 
    `;

    try {
        const [symptoms_logged] = await pool.query(sqlQuery, [loggedInUserId, userId]);

        if (symptoms_logged.length <= 0) {
            return res.status(404).json({
                status: "error",
                message: "No log found"
            });
        } else {
            return res.status(200).json({
                status: "success",
                recordCount: symptoms_logged.length,
                data: symptoms_logged
            });
        }
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            status: "error",
            message: "Failed to retrieve log"
        });
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
                status: "success",
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

        // Parse log_time to ensure it's in the correct format
        const formattedLogTime = new Date(log_time).toISOString().slice(0, 19).replace('T', ' ');

        const [updateSymptomLogged] = await pool.query(sqlQuery,[symptom_id, formattedLogTime, severity, slId]);

        if (updateSymptomLogged.affectedRows <= 0) {
            res.status(404).json({
               status: "error",
               message: "Not Found" 
            })
        } else {
            res.status(200).json({
                status: "success",
                updateLoggedSymptom: updateSymptomLogged.affectedRows, 
            });
        }
    } catch (error) {
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
                status: "success",
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

    // Get the most recent logged symptom for the logged-in user
export async function getMostRecentLoggedSymptom(req, res, _next) {
    const sqlQuery = `
    SELECT symptom_id, log_time, severity
    FROM symptom_log
    WHERE user_id = ?
    ORDER BY log_time DESC
    LIMIT 1
    `;

    const user_id = req.user.id; // Assuming req.user contains the authenticated user's details
    

    try {
        const [recentSymptom] = await pool.query(sqlQuery, [user_id]);

        if (recentSymptom.length === 0) {
            res.status(404).json({
                status: "error",
                message: "No symptom logs found for this user"
            });
        } else {
            res.status(200).json({
                status: "success",
                symptom: recentSymptom[0]
            });
        }
    } catch (error) {
        console.log(error);

        res.status(500).json({
            status: "error",
            message: "Failed to retrieve the most recent logged symptom"
        });
    }
}

