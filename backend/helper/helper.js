const { pool } = require("../db");
const ApiError = require("../utils/ApiErrors");
const asyncHandler = require("../utils/asyncHandler");

// RETURN IF THE USER EXIST OR NOT IN DATABASE 
const doesUserExistWithThisEmail_body = async (req, res)=>{
    const email = req.body.email;
    try {
        const [rows] = await pool.query(
            `SELECT id FROM users WHERE email = ?`,
            [email]
        );

        return rows?.length;
   
    } catch (error) {
            return res.status(500).json(new ApiError(500, `ErorrU.") In doesUserExistWithThisEmail_body:` ,error?.message))
    }

}

function formatDate(date = new Date()) {   // this gives current date in this formate: 2022-01-01 10:00:00
  const pad = n => String(n).padStart(2, '0');

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

module.exports={
    doesUserExistWithThisEmail_body,
    formatDate,

}