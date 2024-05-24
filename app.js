import express from "express";
import cors from "cors";
import morgan from "morgan";

import bodyParser from "body-parser";
import nodemailer from "nodemailer";
import session from "express-session";
import { appointmentRouter } from "./routes/appointmentRouter.js";
import { symptomsLogRouter } from "./routes/symptomsLogRouter.js";
import { carerRouter } from "./routes/carerRouter.js";
import { symptomRouter } from "./routes/symptomRouter.js";
import { authRouter } from "./routes/authRouter.js";

const app= express();
const port = process.env.PORT || 4444

let cookie;
// session configuration
app.use(
	session({
		secret: "c_s_secret",
		resave: false,
		saveUninitialized: false,
		cookie: { secure: false, maxAge: 3600 },
		name: "xpecting",
		maxAge: 3600,
		store: cookie,
	}),
);


app.options("*", cors(["http://localhost:56262"]));
app.use(cors(["http://localhost:56262"]));

app.use(express.urlencoded({ extended: true, limit: "1kb" }));
app.use(express.json({ limit: "1kb" }));

if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));




// import routes

app.use("/api/v1/xpecting/appointment/", appointmentRouter); 
app.use("/api/v1/xpecting/auth/", authRouter); 
app.use("/api/v1/xpecting/symptoms-tracker/", symptomsLogRouter); 
app.use("/api/v1/xpecting/carers/", carerRouter); 
app.use("/api/v1/xpecting/symptoms/", symptomRouter); 
 

app.listen(port, () => console.log(`server running on http://localhost:${port}`));