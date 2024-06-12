/**
 * Filename: 		emailRouter.js
 * Description:
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-06-03
 */

import express from "express";
import { Email } from "../utils/email.js";

export const emailRouter = express.Router();

// Create Appointment Route
emailRouter.post("/create-appointment", async (req, res) => {
  try {
    if (!req.user || !req.user.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const emailSender = new Email(req.user.email);

    const { user_id, carer_id, scheduled_time, note } = req.body;


    await emailSender.sendMail(emailContent, "Appointment Confirmation");

    res.status(201).json({
      status: "success",
      message: "Appointment created successfully and confirmation email sent",
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    if (!res.headersSent) {
      res.status(500).json({
        status: "error",
        message: "Failed to create new appointment",
        error: error.message,
      });
    }
  }
});

// New Registration Mail Route
emailRouter.post("/new-registration-mail", async (req, res) => {
  try {
    const { first_name, last_name, email, carer_id, scheduled_time } = req.body;
    const emailSender = new Email(email); // Use provided email

    const emailContent = `
      <p>Dear ${first_name} ${last_name},</p>
      
    `;

    await emailSender.sendMail(emailContent, "Thank you for registering");

    res.status(200).json({ message: "Registration email sent successfully" });
  } catch (error) {
    console.error("Error sending registration email:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to send registration email" });
    }
  }
});
