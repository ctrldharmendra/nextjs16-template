
const jwt = require('jsonwebtoken');
const {pool} = require('../db/index');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiErrors');


const authenticateAccessToken = asyncHandler (async (req, res, next)=>{
    let authHeader = req.headers.authorization || '';
   let token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

   if(!token){
       if(!req?.cookies?.accessToken){
           return res.status(401).json(new ApiError(401, '', "accessToken not found"))
       }
       //    this extract token from browser cookies 
       token = req?.cookies?.accessToken;
   }

    if(!token){
        return res.status(401).json(new ApiError(401, "", "Token Not Found"));
    }

        try {
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            // console.log(decoded)
            const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded?.id])
            // console.log(rows, "rows")

            if(!rows.length){
        return res.status(401).json(new ApiError(401, "", "Token Invalid"));
            }

        // console.log(rows, "rows")
            const {password:_, ...withoutPassword} = rows[0];
              req.user = withoutPassword;
         
             next();


        } catch (error) {
                    return res.status(401).json(new ApiError(401, "", `AuthenticateAccesToken Catch error: ${error}`));
        }


})





module.exports = {
   authenticateAccessToken,
}