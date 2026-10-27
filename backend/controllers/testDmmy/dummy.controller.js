const asyncHandler = require("../../utils/asyncHandler")
const ApiError = require("../../utils/ApiErrors")
const ApiResponse = require("../../utils/ApiResponse")
const { pool } = require("../../db")
const path = require('path')
const fs = require("fs/promises");
const saveFiles = require("../../middlewares/upload")



//   this.statusCode = statusCode;
//         this.data = data;
//         this.message = message;
//         this.success = statusCode < 400
// catch 
//   statusCode, 
//         message =  "Something went wrong",
//         errors = [],


const getDummy = asyncHandler(async (req, res)=>{
        try {
    const [rows] = await pool.query(
        `SELECT * FROM dummyitems`
    );
        res.set('Cache-Control', 'no-store');   //-->  dont use cache
        return res.status(200).json(new ApiResponse(200, rows, " successfully."))
        } catch (error) {
            return res.status(500).json(new ApiError(500, `ErorrU.") In getAllUser:` ,error?.message))
        }

})


const createDummy = asyncHandler(async (req, res)=>{
    const {item} = req.body;
    try {
        const [rows] = await pool.query(
            `INSERT INTO dummyitems (name)  VALUES (?)`,
            [item]
        );
        let createdItem = await pool.query(`SELECT * FROM dummyitems WHERE id = ?`, [rows?.insertId]);
        return res.status(200).json(new ApiResponse(200, createdItem, "successfully."))
    } catch (error) {
        return res.status(500).json(new ApiError(500, `ErorrU.") In createDummy:` ,error?.message))
    }
})
module.exports = {
    getDummy,
    createDummy
};