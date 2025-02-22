const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    // Obtener el token del header y limpiarlo
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        error: 'Token no proporcionado',
        requiresLogin: true 
      });
    }

    try {
      // Verificar y decodificar el token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Asegurarnos de que usamos el campo correcto del token
      const userId = decoded.userId || decoded.id;
      
      if (!userId) {
        return res.status(403).json({ 
          error: 'Token inválido',
          requiresLogin: true
        });
      }

      const user = await User.findById(userId);

      if (!user) {
        return res.status(401).json({ 
          error: 'Usuario no encontrado',
          requiresLogin: true
        });
      }

      // Guardar tanto el usuario como su ID en req
      req.user = user;
      req.userId = userId;
      
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Sesión expirada',
          requiresLogin: true,
          message: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.'
        });
      }
      throw error;
    }
  } catch (error) {
    console.error('Error de autenticación:', error);
    res.status(401).json({ 
      error: 'Por favor autentíquese',
      requiresLogin: true
    });
  }
};

module.exports = auth;