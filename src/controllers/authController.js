const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOTP } = require('../utils/emailService');
const crypto = require('crypto');
const nodemailer = require('nodemailer');


// Objeto temporal en memoria para almacenar OTP y su expiración
let otpStore = {};
let verificationCodeStore = {}; // Para almacenar el código de verificación de la contraseña
// Función para generar OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Función para generar un código de verificación
const generateVerificationCode = () => {
  return crypto.randomBytes(3).toString('hex'); // Genera un código de 6 caracteres
};

// Función para enviar el código de verificación
const sendVerificationCode = async (email, code) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    to: email,
    from: process.env.EMAIL_USER,
    subject: 'Código de verificación para restablecer contraseña',
    text: `Tu código de verificación es: ${code}. Este código expirará en 1 hora.`
  };

  await transporter.sendMail(mailOptions);
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // OTP válido por 5 minutos

    // Guardar OTP en memoria temporal (en un objeto global)
    otpStore[email] = { otp, expiresAt };

    // Enviar OTP por correo electrónico
    const emailSent = await sendOTP(email, otp);
    if (!emailSent) {
      return res.status(500).json({
        message: 'Error al enviar el código de verificación. Por favor, intenta de nuevo.',
      });
    }

    res.json({
      message: 'Código de verificación enviado',
      requiresOTP: true,
      email: email,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      message: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// Función para verificar el OTP sin almacenarlo en la base de datos
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Verificar si el OTP está almacenado y no ha expirado
    if (!otpStore[email]) {
      return res.status(400).json({ message: 'Código de verificación no válido' });
    }

    const storedOTP = otpStore[email];
    
    // Verificar si el OTP ha expirado
    if (new Date() > storedOTP.expiresAt) {
      delete otpStore[email]; // Limpiar OTP expirado
      return res.status(400).json({ message: 'El código ha expirado' });
    }

    // Verificar si el OTP coincide
    if (storedOTP.otp !== otp) {
      return res.status(400).json({ message: 'Código incorrecto' });
    }

    // Eliminar OTP de la memoria
    delete otpStore[email];

    // Obtener usuario y generar token
    const user = await User.findOne({ email });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Error verificando OTP:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error del servidor' });
  }
}; 

exports.register = async (req, res) => {
  try {
    const { 
      email, 
      password, 
      nombre, 
      apellido, 
      tipoDocumento, 
      numeroCedula, 
      ciudad, 
      codigoPais, 
      numeroTelefonico 
    } = req.body;

    // Validar campos requeridos
    if (!email || !password || !nombre || !apellido || !tipoDocumento || !numeroCedula || !ciudad || !numeroTelefonico) {
      return res.status(400).json({ message: 'Por favor, completa todos los campos' });
    }

    // Verificar si el usuario ya existe por correo electrónico
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo ya está registrado. Por favor, inicia sesión.' });
    }

    // Verificar si el número de cédula ya está registrado
    const existingCedula = await User.findOne({ numeroCedula });
    if (existingCedula) {
      return res.status(400).json({ message: 'El número de cédula ya está asociado a una cuenta.' });
    }

    // Crear el usuario
    const newUser = new User({
      email,
      password: await bcrypt.hash(password, 10),
      nombre,
      apellido,
      tipoDocumento,
      numeroCedula,
      ciudad,
      codigoPais,
      numeroTelefonico
    });

    await newUser.save();
    res.status(201).json({ message: 'Usuario registrado exitosamente' });

  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ message: 'Error del servidor', error: error.message });
  }
};

exports.verifyCode = async (req, res) => {
  const { email, code } = req.body;

  try {
    // Verificar el usuario
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar el código
    if (user.resetPasswordToken !== code || user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ message: 'Código inválido o expirado.' });
    }

    res.status(200).json({ message: 'Código verificado. Ahora puedes restablecer tu contraseña.' });
  } catch (error) {
    console.error('Error al verificar el código:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { emailOrDoc } = req.body;

  try {
    const user = await User.findOne({
      $or: [{ email: emailOrDoc }, { numeroCedula: emailOrDoc }]
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const verificationCode = crypto.randomBytes(3).toString('hex');
    await sendVerificationCode(user.email, verificationCode);

    // Guardar el código y el identificador en el usuario
    user.resetPasswordToken = verificationCode;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    user.resetIdentifier = emailOrDoc; // Almacenar el identificador
    await user.save();

    res.status(200).json({ message: 'Código de verificación enviado' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

exports.resetPassword = async (req, res) => {
  const { newPassword } = req.body; // Solo necesitas la nueva contraseña

  try {
    // Buscar al usuario usando el identificador almacenado
    const user = await User.findOne({
      resetPasswordToken: req.body.token, // Asegúrate de que el token se envíe en la solicitud
      resetIdentifier: req.body.identifier // Usar el identificador almacenado
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado o token inválido' });
    }

    // Hashear y actualizar la contraseña
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = undefined; // Limpiar el token
    user.resetIdentifier = undefined; // Limpiar el identificador
    await user.save();

    res.status(200).json({ message: 'Contraseña restablecida con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};