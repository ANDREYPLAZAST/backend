const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const testUser = new User({
      email: 'stevenplazas77@gmail.com',
      password: hashedPassword
    });

    await testUser.save();
    console.log('Usuario de prueba creado exitosamente');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error al crear usuario de prueba:', error);
    mongoose.connection.close();
  }
}

createTestUser(); 