const express = require('express')
const router = express.Router();
const userController = require('../controllers/user/userController')
const { sendVerificationEmail, generateOtp } = require('../controllers/user/userController');
 // Import your controller methods





router.get("/pageNotFound",userController.pageNotFound)
router.get("/",userController.loadHomepage)
router.get("/signin",userController.loadSignIn)
router.get('/signup',userController.loadSignUp)
router.post('/signup',userController.verifyRegister)
router.get('/verify',userController.loadOtpPage)
router.post('/verify',userController.verifyOtp)




module.exports = router;