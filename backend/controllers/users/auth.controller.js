const asyncHandler = require("../../utils/asyncHandler")
const ApiError = require("../../utils/ApiErrors")
const ApiResponse = require("../../utils/ApiResponse")
const { pool } = require("../../db")
const path = require('path')
const fs = require("fs/promises");
const {saveFiles} = require("../../middlewares/upload")
const { doesUserExistWithThisEmail_body, formatDate } = require("../../helper/helper")
const bcrypt = require("bcrypt");
const { sendOtpEmail } = require('../../utils/email/sendOtpEmail');
const ms = require("ms");
const jwt = require('jsonwebtoken');



// create access toekn 
const createAccessToken = (userObject)=>{

  return jwt.sign(
    {
      id: userObject.id,
      email: userObject.email,
      username: userObject.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRATION || '15m' }
  );
}

// create refresh token
const createRefreshToken = (userObject)=>{
  return jwt.sign(
    {
      id: userObject.id,
      email: userObject.email,
      username: userObject.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION || '15m' }
  );
}

// refresh token | after accesstoken expired  
const refreshToken = asyncHandler(async (req, res)=>{
    const oldRefToken = req?.cookies?.refreshToken;
    if(!oldRefToken) return res.status(400).json(new ApiError(400, "Refresh Token Required.", "Please provide refresh token."))

        try {
            const decoded = jwt.verify(oldRefToken, process.env.REFRESH_TOKEN_SECRET);
            const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [decoded?.id])
            if(!rows.length){
        return res.status(401).json(new ApiError(401, "", "Token Invalid"));
            }
            const {password:_, ...withoutPassword} = rows[0];
              req.user = withoutPassword;    
            const accessToken = createAccessToken(req.user);
            res.cookie('accessToken', accessToken, {
                httpOnly: process.env.NODE_ENV === 'production',
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'lax',
                maxAge: ms(process.env.ACCESS_TOKEN_EXPIRATION)
            });
              const refreshToken = createRefreshToken(req.user);
            res.cookie('refreshToken', refreshToken, {
                httpOnly: process.env.NODE_ENV === 'production',
                secure: process.env.NODE_ENV === 'production',
                sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'lax',
                maxAge: ms(process.env.REFRESH_TOKEN_EXPIRATION)
            });

            return res.status(200).json(new ApiResponse(200, req.user, "Refresh Token Created."))

        } catch (error) {
            return res.status(500).json(new ApiError(500, `ErorrU.") In refreshToken:`, error?.message))
        }
})



// SIGNUP :
const signup = asyncHandler(async (req, res) => {

    let { username, password, email } = req.body;
    const connection = await pool.getConnection();

    if (!req?.file) return res.status(400).json(new ApiError(400, "Image Required.", "Please upload image."))

        const doesthisUserExist = await doesUserExistWithThisEmail_body(req, res);
        if (doesthisUserExist) return res.status(400).json(new ApiError(400, "User Already Exist.", "User Already Exist."))

    try {

        await connection.beginTransaction();  //from where insert start
        const [rows] = await connection.query(
            `INSERT INTO users (username, password, email) VALUES (?, ?, ?)`,
            [username, password, email]
        );

        // // check if image saved or not 
        const saved = await saveFiles(req, 'users');
        
        if (saved?.dp) {
            await connection.query('UPDATE users SET profile = ? WHERE id = ?', [saved?.dp, rows?.insertId])
        }

// update in user dets save isVerified etc
const currDate = await formatDate();
    const otp = Math.floor(100000 + Math.random() * 900000);
    const hashedOtp = await bcrypt.hash(otp.toString(), 10);

const [result] = await connection.query(
    `INSERT INTO users_dets (otp, otp_created_at, user_id, is_verified) VALUES (?, ?, ?, ?)`,
    [hashedOtp, currDate, rows?.insertId, false]
)

if(result?.affectedRows > 0){
    const info = await sendOtpEmail({
    to: req.body.email,
    otp,
});

if (info?.accepted?.length > 0) {
  console.log("OTP email sent successfully");
    // return res.json(new ApiResponse(201, {}, "Otp Created."));
} else {
    console.log("Email failed");
    return res.status(401).json({ success: false, message: 'Email couldNot be sent', error: error.message });
}

}


        await connection.commit();

        // return success response
        const user = await connection.query(`SELECT * FROM users WHERE id = ?`, [rows?.insertId]);

        return res.status(200).json(new ApiResponse(201, user, "User created successfully."))

    } catch (error) {
        await connection.rollback();
        return res.status(500).json(new ApiError(500, `ErorrU.") In signup:`, error?.message))
    } finally {
        connection.release();
    }
})

// VERIFY OTP :
const verifyOtp = asyncHandler(async (req, res)=>{

    const {email} = req?.params;
if(!req?.body || !req?.body?.otp) return res.status(400).json(new ApiError(400, "Otp Required.", "Please provide otp."))

    try {
        // check if otp is expired or invalid 
// 1. check if otp is expired
// 2. check if otp is match 
// get userId 
const [user] = await pool.query(
    `SELECT * FROM users WHERE email = ?`,
    [email]
);

// check if otp is expired 
const [isOtpNotExpired] = await pool.query(
    `SELECT id, otp FROM users_dets WHERE user_id = ? AND otp_created_at >= DATE_SUB(NOW(), INTERVAL 10 MINUTE)`,
    [user?.[0]?.id] 
)

if(isOtpNotExpired?.length<=0) return res.json(new ApiResponse(400, [], "Otp Expired."))
// match otp 
const isMatch = await bcrypt.compare(
       String(req.body.otp).trim(),
    isOtpNotExpired?.[0]?.otp
);
if (!isMatch) {
    return res.json(
        new ApiResponse(400, [], "Invalid OTP.")
    );
}

// if otp is matched and not expired after passing all above 
// now make the user logged in by setting toekn in cookies 
let userObject = user?.[0];
const accessToken = createAccessToken(userObject);
const refreshToken = createRefreshToken(userObject);

  res.cookie('accessToken', accessToken, {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'lax',
      maxAge: ms(process.env.REFRESH_TOKEN_EXPIRATION)
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: process.env.NODE_ENV === 'production',
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'lax',
      maxAge: ms(process.env.REFRESH_TOKEN_EXPIRATION)
    });



        return res.status(200).json(new ApiResponse(200, isOtpNotExpired, "Otp Verified."))
    } catch (error) {
        return res.status(500).json(new ApiError(500, `ErorrU.") In verifyOtp:`, error?.message))
    }
})

// LOGIN :
const login = asyncHandler(async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password) return res.status(400).json(new ApiError(400, "Email or Password Required.", "Please provide email and password."))
            try {
                const [rows] = await pool.query(
                    `SELECT * FROM users WHERE email = ?`,
                    [email]
                );
                if(!rows.length){
        return res.status(401).json(new ApiError(401, "", "Email or Password Invalid"));
                }
                const {password:_, ...withoutPassword} = rows[0];
                console.log(rows?.[0]?.password)

                // if(bcrypt.compareSync(password, rows?.[0]?.password)){

                    const accessToken = createAccessToken(withoutPassword);
                    res.cookie('accessToken', accessToken, {
                        httpOnly: process.env.NODE_ENV === 'production',
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'lax',
                        maxAge: ms(process.env.ACCESS_TOKEN_EXPIRATION)
                    });
                    const refreshToken = createRefreshToken(withoutPassword);
                    res.cookie('refreshToken', refreshToken, {
                        httpOnly: process.env.NODE_ENV === 'production',
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: process.env.NODE_ENV == 'production' ? 'none' : 'lax',
                        maxAge: ms(process.env.REFRESH_TOKEN_EXPIRATION)
                    });
                    return res.status(200).json(new ApiResponse(200, withoutPassword, "Login Success."))
                // } else {
                //     return res.status(401).json(new ApiError(401, "", "Email or Password Invalid"));
                // }
            } catch (error) {
                return res.status(500).json(new ApiError(500, `ErorrU.") In login:`, error?.message))
            }
})  

module.exports = {
    verifyOtp,
    signup,
    refreshToken,
    login,
};