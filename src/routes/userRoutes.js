const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const User = require('../models/User');
const bcryptjs = require('bcryptjs');

// Configurar multer para el almacenamiento de archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../../uploads/profile-images/')) // Ruta absoluta
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname)
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // límite de 5MB
    },
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten archivos de imagen (jpeg, jpg, png)'));
    }
}).single('profileImage'); // Cambiar 'image' por 'profileImage'

// Ruta para subir imagen de perfil
router.post('/users/profile-image', auth, (req, res) => {
    upload(req, res, async function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ error: 'Error al subir el archivo: ' + err.message });
        } else if (err) {
            return res.status(400).json({ error: 'Solo se permiten imágenes (jpeg, jpg, png)' });
        }
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'No se subió ningún archivo' });
            }

            const user = await User.findByIdAndUpdate(
                req.user._id,
                { profileImage: `/uploads/profile-images/${req.file.filename}` },
                { new: true }
            );
            res.json({ 
                message: 'Imagen actualizada correctamente',
                profileImage: user.profileImage
            });
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({ error: 'Error al actualizar la imagen de perfil' });
        }
    });
});

// Ruta para obtener datos del usuario
router.get('/users/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .select('email nombre apellido tipoDocumento numeroCedula ciudad codigoPais numeroTelefonico profileImage balanceActual balanceInicial moneda movimientos suscripciones twoFactorEnabled');
        
        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Devolver los datos exactos de la base de datos
        const response = {
            status: 'success',
            data: {
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido,
                tipoDocumento: user.tipoDocumento,
                numeroCedula: user.numeroCedula,
                ciudad: user.ciudad,
                codigoPais: user.codigoPais,
                numeroTelefonico: user.numeroTelefonico,
                profileImage: user.profileImage,
                balanceActual: user.balanceActual,
                balanceInicial: user.balanceInicial,
                moneda: user.moneda,
                movimientos: user.movimientos || [],
                suscripciones: user.suscripciones || [],
                twoFactorEnabled: user.twoFactorEnabled
            }
        };

        res.json(response);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Error al obtener datos del usuario',
            error: error.message 
        });
    }
});

// Ruta para actualizar datos del usuario
router.put('/users/profile/:userId', auth, async (req, res) => {
    try {
        const paramUserId = req.params.userId;
        const tokenUserId = req.userId || req.user._id.toString();

        console.log('Comparando IDs:', {
            paramUserId,
            tokenUserId,
            userIdFromReq: req.user._id.toString()
        });

        if (paramUserId !== tokenUserId) {
            return res.status(403).json({ 
                error: 'No tienes permiso para actualizar este perfil',
                message: 'El ID del usuario no coincide con el token',
                debug: {
                    paramUserId,
                    tokenUserId
                }
            });
        }

        const {
            nombre,
            apellido,
            tipoDocumento,
            numeroCedula,
            ciudad,
            codigoPais,
            numeroTelefonico
        } = req.body;

        const updateData = {
            nombre,
            apellido,
            tipoDocumento,
            numeroCedula,
            ciudad,
            codigoPais,
            numeroTelefonico
        };

        const user = await User.findByIdAndUpdate(
            paramUserId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        // Devolver el usuario actualizado con todos los campos
        res.json({
            message: 'Perfil actualizado correctamente',
            user: {
                id: user._id,
                email: user.email,
                nombre: user.nombre,
                apellido: user.apellido,
                tipoDocumento: user.tipoDocumento,
                numeroCedula: user.numeroCedula,
                ciudad: user.ciudad,
                codigoPais: user.codigoPais,
                numeroTelefonico: user.numeroTelefonico,
                profileImage: user.profileImage
            }
        });
    } catch (error) {
        console.error('Error completo:', error);
        res.status(500).json({ 
            error: 'Error al actualizar datos del usuario',
            details: error.message
        });
    }
});

// Ruta para cambiar contraseña
router.post('/users/change-password', auth, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id);

        // Verificar contraseña actual
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(400).json({ error: 'Contraseña actual incorrecta' });
        }

        // Actualizar contraseña usando bcryptjs
        user.password = await bcryptjs.hash(newPassword, 10);
        await user.save();

        res.json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
        res.status(500).json({ error: 'Error al cambiar la contraseña' });
    }
});

module.exports = router; 