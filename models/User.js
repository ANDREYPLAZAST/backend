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
  numeroCedula: {
    type: String,
    required: true
  },
  // Otros campos...
});

module.exports = mongoose.model('User', userSchema); 