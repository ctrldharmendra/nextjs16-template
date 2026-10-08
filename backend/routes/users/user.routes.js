const {Router} = require('express');
const router = Router();
const { upload }     = require('../../middlewares/upload');
const { authenticateAccessToken } = require('../../middlewares/authMiddleWare');
const userController = require('../../controllers/users/user.controller');


// GET USERS
router.route('/').get(
    authenticateAccessToken,
    userController.getAllUser
);

module.exports = router;