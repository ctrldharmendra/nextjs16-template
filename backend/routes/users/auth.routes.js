const {Router} = require('express');
const router = Router();
const { upload }     = require('../../middlewares/upload');
const { authenticateAccessToken } = require('../../middlewares/authMiddleWare');
const authController = require('../../controllers/users/auth.controller');

// signup :
router.route('/signup').post(
    upload({folder: 'users'}).single('dp'),
    authController.signup
);
// verify otp :
router.route('/verifyOtp/:email').post(
    authController.verifyOtp
);

// refresh token :
router.route('/refreshToken').post(
    authController.refreshToken
);
// login 
router.route('/login').post(
    authController.login
);


module.exports = router;