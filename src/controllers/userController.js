const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Actualizar perfil
exports.updateProfile = async (req, res) => {
  try {
    const { nombre, apellido, ciudad, codigoPais, numeroTelefonico } = req.body;

    // Validar que se proporcionaron todos los campos requeridos
    if (!nombre || !apellido || !ciudad || !codigoPais || !numeroTelefonico) {
      return res.status(400).json({ 
        message: 'Todos los campos son requeridos' 
      });
    }

    // Buscar y actualizar el usuario
    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        nombre,
        apellido,
        ciudad,
        codigoPais,
        numeroTelefonico
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Devolver el usuario actualizado
    res.json({
      message: 'Perfil actualizado correctamente',
      user: {
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        tipoDocumento: user.tipoDocumento,
        numeroCedula: user.numeroCedula,
        ciudad: user.ciudad,
        codigoPais: user.codigoPais,
        numeroTelefonico: user.numeroTelefonico
      }
    });

  } catch (error) {
    console.error('Error actualizando perfil:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Datos inválidos' });
    }
    res.status(500).json({ message: 'Error al actualizar el perfil' });
  }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Validar que se proporcionaron ambas contraseñas
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        message: 'Se requieren la contraseña actual y la nueva contraseña' 
      });
    }

    // Buscar el usuario
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Verificar la contraseña actual
    const isValidPassword = await bcrypt.compare(currentPassword, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'La contraseña actual es incorrecta' });
    }

    // Hashear y guardar la nueva contraseña
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Contraseña actualizada correctamente' });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ message: 'Error al cambiar la contraseña' });
  }
};

// Subir imagen de perfil
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No se ha proporcionado ninguna imagen' });
    }

    const imageUrl = `http://localhost:5000/uploads/profile-images/${req.file.filename}`;
    
    const user = await User.findByIdAndUpdate(
      req.userId,
      { profileImage: imageUrl },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    res.json({
      message: "Imagen subida exitosamente",
      imageUrl: imageUrl,
      user: user
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    res.status(500).json({ message: 'Error al subir la imagen' });
  }
}; 