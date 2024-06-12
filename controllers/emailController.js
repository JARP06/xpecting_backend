/**
 * Filename: 		emailController.js
 * Description:
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-06-03
 */


import nodemailer from 'nodemailer';
import { pool } from '../database/dbConnection.js';

export async function sendEmail(req, res) {
    try {
        if (!req.user) {
            throw new Error('User is not authenticated');
        }
        const { id: user_id, email: userEmail, f_name, l_name } = req.user;
        const { carer_id, scheduled_time, note } = req.body;

        if (!user_id) {
            throw new Error('User ID is required');
        }

        // Check if appointment already exists
        const appointmentExistsQuery = `
            SELECT COUNT(*) AS count
            FROM appointments
            WHERE user_id = ? AND carer_id = ? AND scheduled_time = ?
        `;

        const [existingAppointments] = await pool.query(appointmentExistsQuery, [user_id, carer_id, scheduled_time]);

        if (existingAppointments[0].count > 0) {
            throw new Error('Appointment already exists for this user with the same carer and scheduled time');
        }

        const query = `INSERT INTO appointments (user_id, carer_id, scheduled_time, note) VALUES (?, ?, ?, ?)`;
        const [newAppointment] = await pool.query(query, [user_id, carer_id, scheduled_time, note]);
        const appointment_id = newAppointment.insertId;

        if (!userEmail) {
            throw new Error('Recipient email is required');
        }

        if (!carer_id) {
            throw new Error('Carer ID is required');
        }

        // Check if carer_id exists in carers table and fetch category
        const carerResult = await pool.query(`SELECT c.category FROM carers c WHERE c.id = ?`, [carer_id]);

        if (!carerResult.length || !carerResult[0].length) {
            throw new Error('Carer information not found for ID: ' + carer_id);
        }

        const carerCategory = carerResult[0][0].category;

        
        

        if (!carerCategory) {
            throw new Error('Carer category not found for ID: ' + carer_id);
        }

        const scheduledDate = new Date(scheduled_time);
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true };
        const scheduledTimeFormatted = scheduledDate.toLocaleString('en-US', options);

        const transporter = nodemailer.createTransport({
            host: process.env.NODE_ENV !== "production" ? 'smtp.mailtrap.io' : 'mail.somedomain.com',
            port: process.env.NODE_ENV !== "production" ? 2525 : 465,
            secure: process.env.NODE_ENV === "production",
            auth: {
                user: process.env.NODE_ENV !== "production" ? process.env.MAILTRAP_USER : process.env.EMAIL_USER,
                pass: process.env.NODE_ENV !== "production" ? process.env.MAILTRAP_PASS : process.env.EMAIL_PASS,
            },
        });
        const mailOptions = {
            from: 'Xpecting Appointments <appointments@xpecting.com>',
            to: userEmail,
            subject: `Appointment Confirmation for ${carerCategory} on ${scheduledTimeFormatted}`,
            html: `
                <img src="cid:xpecting_logo" alt="Xpecting Logo">
                <p>Dear ${f_name} ${l_name},</p>
                <p>This email confirms your upcoming appointment for ${carerCategory} scheduled for ${scheduledTimeFormatted}.</p>
                <p>We appreciate you choosing Xpecting.</p>
                <p>Sincerely,</p>
                <p>The Xpecting Appointments Team</p>
            `,
            attachments: [
                {
                    filename: 'Xpecting (Small).png',
                    path: 'assets/Xpecting (Small).png', 
                    cid: 'xpecting_logo' // same cid value as in the html img src
                }
            ]
        };
        
        await transporter.sendMail(mailOptions);
        
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
    
}
