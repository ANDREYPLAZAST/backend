const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { sendOTP } = require('../utils/emailService');

// Función para generar OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.login = async (req, res) => {
  try {
    console.log('Intento de login para:', req.body.email);
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      console.log('Usuario no encontrado:', email);
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Contraseña inválida para:', email);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar y guardar OTP
    const otp = generateOTP();
    console.log('OTP generado para', email, ':', otp);
    
    user.otp = {
      code: otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000)
    };
    await user.save();

    // Enviar OTP por correo
    const emailSent = await sendOTP(email, otp);
    if (!emailSent) {
      console.error('Error al enviar email a:', email);
      return res.status(500).json({ 
        message: 'Error al enviar el código de verificación. Por favor, intenta de nuevo.' 
      });
    }

    console.log('Login exitoso, OTP enviado a:', email);
    res.json({ 
      message: 'Código de verificación enviado',
      requiresOTP: true,
      email: email
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      message: 'Error del servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || !user.otp || !user.otp.code) {
      return res.status(400).json({ message: 'Código de verificación no válido' });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({ message: 'El código ha expirado' });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({ message: 'Código incorrecto' });
    }

    // Limpiar OTP
    user.otp = undefined;
    await user.save();

    // Generar token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ 
      token, 
      user: { 
        id: user._id, 
        email: user.email 
      }
    });
  } catch (error) {
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

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'El email ya está registrado' });
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
    res.status(500).json({ message: 'Error del servidor' });
  }
};
