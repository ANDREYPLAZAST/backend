const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  nombre: {
    type: String,
    required: true
  },
  apellido: {
    type: String,
    required: true
  },
  tipoDocumento: {
    type: String,
    enum: ['CC', 'CE', 'PASAPORTE'],
    required: true
  },
  numeroCedula: {
    type: String,
    required: true,
    unique: true
  },
  ciudad: {
    type: String,
    required: true
  },
  codigoPais: {
    type: String,
    default: 'co +57'
  },
  numeroTelefonico: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema, 'users');
