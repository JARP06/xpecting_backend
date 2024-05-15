/**
 * Filename: 		auth.js
 * Description:
 * Developed By: 	Toni-Ann Neil
 * Date: 			2024-04-23
 */

//imports
import bcrypt from "bcryptjs";

/**
 * encrypt new password
 * @param {*}password
 * @returns
 */
export async function encryptPW(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

/**
 * check user password entered against database
 * @param {*} password
 * @param {*} encryptedPW
 * @returns
 */
export async function decryptPW(password,encryptedPW) {
    const result = await bcrypt.compare(password, encryptedPW);
    return result;
}

//protect routes 
export const authentication = (req, res, next) => {
    if (sessionData) {
        next();
    }else{
        res.status(401).json({
            status: "error",
            message: "Invalid User"
        });
    }
}
