/**
 * Filename: 		appointmentController.js
 * Description:
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-05-10
 */

// import
import {pool} from "../database/dbConnection.js";

// todo create appointment
export async function createAppointment(req, res, _next) {
  const sqlQuery = `
    INSERT INTO appointments(user_id, carer_id, scheduled_time)
    VALUES(?,?,?)
  `;
  try{
    const { user_id, carer_id, scheduled_time } = req.body;
    const [newAppointment]= await pool.query(sqlQuery,[user_id, carer_id, scheduled_time]);

    res.status(201).json({
        status:"success",
        appointmentId: newAppointment.insertId,
    });
  }catch(error) {
    console.log(error);

    //handle dups
    if (error.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
          status: "error",
          message: "Duplicate appointment entry"
        });
      }
      

    res.status(400).json({
        status: "error",
        message: "Failed to create new appointment"
    });
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

  const sqlQuery = `
    SELECT a.*, c.category, u.f_name, u.l_name
    FROM appointments a
    INNER JOIN carers c ON a.carer_id = c.id
    INNER JOIN users u ON a.user_id = u.id
    WHERE a.user_id = ?
  `;

  try {
    const [appointments] = await pool.query(sqlQuery, [loggedInUserId]);

    if (appointments.length <= 0) {
      return res.status(HTTP_STATUS_CODES.NOT_FOUND).json({
        status: 'error',
        message: 'No appointments found',
      });
    } else {
      return res.status(HTTP_STATUS_CODES.OK).json({
        status: 'success',
        recordCount: appointments.length,
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
    SET carer_id = ?, scheduled_time = ?
    WHERE id = ?
  `;

  const aId = req.params.id;

  try {
    const { carer_id, scheduled_time } = req.body;

    const [updateAppt] = await pool.query(sqlQuery, [carer_id, scheduled_time, aId]);

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
    SELECT appointment_id, carer_id, scheduled_time, details
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

//delete appointment 

export async function deleteAppointment(req, res, _next) {
  const sqlQuery=`
    DELETE FROM appointment
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