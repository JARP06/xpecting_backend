/**
 * Filename: 		appointmentController.js
 * Description:
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-05-10
 */

// import
import {pool} from "../database/dbConnection.js";
import { sendEmail } from "./emailController.js"; 

// create appointment
export async function createAppointment(req, res, _next) {
  const sqlQuery = `
    INSERT INTO appointments(user_id, carer_id, scheduled_time, note)
    VALUES(?,?,?,?)
  `;
  try {
    const { user_id, carer_id, scheduled_time, note } = req.body;
    
    // Validate input data (this can be expanded based on your requirements)
    if (!user_id || !carer_id || !scheduled_time) {
      return res.status(400).json({
        status: "error",
        message: "Missing required fields",
      });
    }
    
    const [newAppointment] = await pool.query(sqlQuery, [user_id, carer_id, scheduled_time, note]);
    
    // Attach user info to the request object for the email function
    req.user = {
      id: req.user.id,
      f_name: req.user.f_name,
      l_name: req.user.l_name,
      email: req.user.email
    };
    
    // Call sendEmail function after successfully creating the appointment
    await sendEmail(req, res);
    
    res.status(201).json({
      status: "success",
      message: "Appointment created successfully",
      data: newAppointment
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        status: "error",
        message: "Duplicate appointment entry",
      });
    } else {
      return res.status(500).json({
        status: "error",
        message: "Failed to create new appointment",
      });
    }
  }
}


// get all appointments
export async function allAppointments(req, res) {
  const loggedInUserId = req.user?.id;

  if (!loggedInUserId) {
    return res.status(HTTP_STATUS_CODES.BAD_REQUEST).json({
      status: 'error',
      message: 'User ID not found in request',
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    // Query to count total records
    const countQuery = `
      SELECT COUNT(*) AS count
      FROM appointments a
      INNER JOIN carers c ON a.carer_id = c.id
      INNER JOIN users u ON a.user_id = u.id
    `;
    const [countResult] = await pool.query(countQuery);
    const totalRecords = countResult[0].count;
    const totalPages = Math.ceil(totalRecords / limit);

    // Query to fetch appointments with pagination
    const sqlQuery = `
      SELECT a.*, c.category, u.f_name, u.l_name
      FROM appointments a
      INNER JOIN carers c ON a.carer_id = c.id
      INNER JOIN users u ON a.user_id = u.id
      LIMIT ? OFFSET ?
    `;
    const [appointments] = await pool.query(sqlQuery, [limit, offset]);

    if (appointments.length <= 0) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        status: 'error',
        message: 'No appointments found',
      });
    } else {
      return res.status(HTTP_STATUS_CODES.OK).json({
        status: 'success',
        recordCount: appointments.length,
        totalRecords: totalRecords,
        totalPages: totalPages,
        currentPage: page,
        data: appointments,
      });
    }
  } catch (error) {
    console.error(error);

    return res.status(HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      status: 'error',
      message: 'Failed to retrieve appointments',
      error: error.message,
    });
  }
}


const HTTP_STATUS_CODES = {
  OK: 200,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};



// get single appointment 
export async function singleAppointment(req, res, _next) {
  const sqlQuery = `
    SELECT a.*, c.category, u.f_name, u.l_name
    FROM appointments a
    INNER JOIN carers c ON a.carer_id = c.id
    INNER JOIN users u ON a.user_id = u.id
    WHERE a.id = ?
  `;

  const aId = req.params.id;

  try {
    const [appointment] = await pool.query(sqlQuery, aId);

    if (appointment.length <= 0) {
      res.status(404).json({
        status: "error",
        message: "Appointment not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        data: appointment[0],
      });
    }
  } catch (error) {
    console.log(error);

    res.status(404).json({
      status: "error",
      message: "Failed to locate appointment"
    });
  }
}
//update appointment 
export async function updateAppointment(req, res, _next) {
  const sqlQuery = `
    UPDATE appointments
    SET carer_id = ?, scheduled_time = ?, note = ?
    WHERE id = ?
  `;

  const aId = req.params.id;

  try {
    const { carer_id, scheduled_time, note } = req.body;

    const [updateAppt] = await pool.query(sqlQuery, [carer_id, scheduled_time, note, aId]);

    if (updateAppt.affectedRows <= 0) {
      res.status(404).json({
        status: "error",
        message: "Not found",
      });
    } else {
      res.status(200).json({
        status: "success",
        updatedAppointment: updateAppt.affectedRows,
      });
    }
  } catch (error) {
    console.log(error);

    res.status(404).json({
      status: "error",
      message: "Failed to update",
    });
  }
}

// Get the next upcoming appointment for the logged-in user
export async function getUpcomingAppointment(req, res, _next) {
  const sqlQuery = `
    SELECT appointment_id, carer_id, scheduled_time, note
    FROM appointments
    WHERE user_id = ? AND scheduled_time > NOW()
    ORDER BY scheduled_time ASC
    LIMIT 1
  `;

  const userId = req.user.id; // Assuming req.user contains the authenticated user's details

  try {
    const [upcomingAppointment] = await pool.query(sqlQuery, [userId]);

    if (upcomingAppointment.length === 0) {
      res.status(404).json({
        status: "error",
        message: "No upcoming appointments found for this user",
      });
    } else {
      res.status(200).json({
        status: "success",
        appointment: upcomingAppointment[0],
      });
    }
  } catch (error) {
    console.log(error);

    res.status(500).json({
      status: "error",
      message: "Failed to retrieve the upcoming appointment",
    });
  }
}

// Delete appointment
export async function deleteAppointment(req, res, _next) {
  const sqlQuery = `
    DELETE FROM appointments
    WHERE id = ?
  `;
  const aId =  req.params.id;
  try{
    const [deleteAppt] = await pool.query(sqlQuery, aId);

    if(deleteAppt.affectedRows <=0) {
      res.status(404).json({
        status: "error",
        message: "Appointment not found"
      });
    }else{
      res.status(200).json({
        status: "success",
        message:"appointment deleted"
      });
    }
  }catch(error){
    console.log(error);

    res.status(404).json({
      status: "error",
      message: "Failed to delete appointment"
    })
  }
}