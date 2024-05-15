import express from "express";
import cors from "cors";
import morgan from "morgan";

import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import session from "express-session";
import { appointmentRouter } from "./routes/appointmentRouter.js";
import { symptomsLogRouter } from "./routes/symptomsLogRouter.js";

const app= express();
const port = process.env.PORT || 4444


app.use(express.urlencoded({ extended: true, limit: "1kb" }));
app.use(express.json({ limit: "1kb" }));

if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));



// import routes


app.use("/api/v1/xpecting/appointment", appointmentRouter); 
app.use("/api/v1/xpecting/symptoms-tracker", symptomsLogRouter); 

app.listen(port, () => console.log(`server running on ----http://localhost:${port}`));