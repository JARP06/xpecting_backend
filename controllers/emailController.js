// emailController.js
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

        console.log('Carer ID:', carer_id);
        console.log('Carer Category:', carerCategory);

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
                <p>Dear ${f_name} ${l_name},</p>
                <p>This email confirms your upcoming appointment for ${carerCategory} scheduled for ${scheduledTimeFormatted}.</p>
                <p>We appreciate you choosing Xpecting.</p>
                <p>Sincerely,</p>
                <p>The Xpecting Appointments Team</p>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error.message);
    }
}


// Assuming you're sending user data in the request body
export const sendEmailAfterSignup = (user) => {
  // Email content
  const mailOptions = {
    from: "your-mailtrap-inbox@example.com",
    to: user.email,
    subject: "Welcome to Our Platform!",
    text: `
            Dear ${user.firstName} ${user.lastName},
            
            Thank you for signing up with us! We're excited to have you on board.
            
            Best regards,
            The Team
        `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
};
