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
      <p>Welcome to Chatham Evening School! We are thrilled to have you join our vibrant community of learners.</p>
      <p>Your registration marks the beginning of an enriching educational journey filled with opportunities for growth, discovery, and success.</p>
      <p>At Chatham Evening School, we are committed to providing you with a supportive environment where you can thrive academically, socially, and personally.</p>
      <p>Once again, welcome to Chatham Evening School! Get ready to embark on an unforgettable educational journey filled with endless possibilities.</p>
      <p>Best regards,<br>Chatham Evening School</p>
    `;

    await emailSender.sendMail(emailContent, "Welcome to Chatham Evening School - Get Ready to Dive into an Exciting Journey!");

    res.status(200).json({ message: "Registration email sent successfully" });
  } catch (error) {
    console.error("Error sending registration email:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to send registration email" });
    }
  }
});
