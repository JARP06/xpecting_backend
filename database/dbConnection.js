/**
 * Filename: 		dbConnection.js
 * Description:
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-05-05
 */

import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config({path: "./config.env"})

export const pool = mysql
    .createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_NM,
        password: process.env.DB_PW,

    })
    .promise();