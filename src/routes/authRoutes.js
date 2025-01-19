const router = require('express').Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// Ruta para login
router.post('/auth/login', authController.login);

// Ruta para verificar OTP
router.post('/auth/verify-otp', authController.verifyOTP);

// Ruta para obtener el perfil del usuario
router.get('/auth/profile', auth, authController.getProfile);

// Ruta para verificar código de restablecimiento de contraseña
router.post('/auth/verify-code', authController.verifyCode);  // Asegúrate de que esta ruta esté aquí

// Ruta para registrar un nuevo usuario
router.post('/auth/register', authController.register);

// Ruta para restablecer la contraseña
router.post('/auth/reset-password', authController.resetPassword);

// Ruta para solicitar restablecimiento de contraseña
router.post('/auth/forgot-password', authController.forgotPassword);

module.exports = router;