const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    required: true
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
  },
  profileImage: {
    type: String,
    default: null
  },
  balanceInicial: {
    type: Number,
    default: 0
  },
  balanceActual: {
    type: Number,
    default: 0
  },
  moneda: {
    type: String,
    default: 'COP'
  },
  suscripciones: [{
    nombre: String,
    monto: Number,
    frecuencia: {
      type: String,
      enum: ['mensual', 'anual']
    },
    fechaInicio: Date,
    estado: {
      type: String,
      enum: ['activa', 'pausada', 'cancelada'],
      default: 'activa'
    }
  }],
  movimientos: [{
    tipo: {
      type: String,
      enum: ['ingreso', 'egreso', 'inversion', 'credito']
    },
    descripcion: String,
    monto: Number,
    fecha: {
      type: Date,
      default: Date.now
    }
  }],
  twoFactorEnabled: {
    type: Boolean,
    default: false
  },
  metaAhorro: {
    type: Number,
    default: 0
  }
});

userSchema.methods.comparePassword = async function(password) {
    return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema, 'users');
