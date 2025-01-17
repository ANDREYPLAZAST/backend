require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function createTestUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB Atlas');

        const hashedPassword = await bcrypt.hash('test123', 10);
        const testUser = new User({
            email: 'stevenplazas77@gmail.com',
            password: hashedPassword,
            nombre: 'Juan Perez',
            tipoDocumento: 'CC',
            numeroCedula: '123456789',
            numeroTelefonico: '3112345678'
        });

        await testUser.save();
        console.log('Usuario creado en MongoDB Atlas');

    } catch (error) {
        console.error('Error específico:', error);
    } finally {
        await mongoose.connection.close();
    }
}

createTestUser(); 