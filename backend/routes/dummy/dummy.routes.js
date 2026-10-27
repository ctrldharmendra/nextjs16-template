const {Router} = require('express');
const router = Router();
const { upload }     = require('../../middlewares/upload');
const { authenticateAccessToken } = require('../../middlewares/authMiddleWare');
const dummyController = require('../../controllers/testDmmy/dummy.controller');

// GET DUMMY
router.route('/').get(
    dummyController.getDummy
);
// create dummy
router.route('/').post(
    dummyController.createDummy
);
module.exports = router;