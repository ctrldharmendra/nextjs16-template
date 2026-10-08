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

// GET ALL USERS 
const getAllUser = asyncHandler(async (req, res)=>{
        try {
let user =[
    {
        id: 1,
        username: "dharmendrathakur",
        email: "dharmendrathakur@gmail.com",
    },
    {
        id: 2,
        username: "dharmendrathakur",
        email: "dharmendrathakur@gmail.com",
    },
]
        return res.status(200).json(new ApiResponse(200, user, "User fetched successfully."))
        } catch (error) {
            return res.status(500).json(new ApiError(500, `ErorrU.") In getAllUser:` ,error?.message))
        }

})

module.exports = {
    getAllUser,
};