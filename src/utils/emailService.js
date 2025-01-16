const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  debug: true,
  logger: true
});

transporter.verify(function(error, success) {
  if (error) {
    console.log('Error de configuración del servidor de correo:', error);
  } else {
    console.log('Servidor de correo listo para enviar mensajes');
  }
});

const sendOTP = async (email, otp) => {
  try {
    console.log('Intentando enviar OTP a:', email);
    const mailOptions = {
      from: `"InvestCoop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Código de verificación - InvestCoop',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #238636;">InvestCoop - Verificación</h2>
          <p>Tu código de verificación es:</p>
          <h1 style="color: #238636; font-size: 32px; letter-spacing: 5px;">${otp}</h1>
          <p>Este código expirará en 5 minutos.</p>
          <p>Si no solicitaste este código, por favor ignora este correo.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado:', info.response);
    return true;
  } catch (error) {
    console.error('Error detallado al enviar email:', error);
    return false;
  }
};

module.exports = { sendOTP }; 