const router = require('express').Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/auth/login', authController.login);
router.post('/auth/verify-otp', authController.verifyOTP);
router.get('/auth/profile', auth, authController.getProfile);

module.exports = router; 