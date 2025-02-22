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

// Para el código OTP de inicio de sesión
const sendOTP = async (email, otp) => {
  try {
    const mailOptions = {
      from: `"InvestCoop 💰" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Código de Verificación - InvestCoop',
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

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error al enviar OTP:', error);
    return false;
  }
};

// Para el código de restablecimiento de contraseña
const sendVerificationCode = async (email, code) => {
  try {
    const mailOptions = {
      from: `"InvestCoop 💰" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Restablecimiento de Contraseña - InvestCoop',
      html: `
        <div style="background-color: #f6f9fc; padding: 40px 0; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <img src="https://i.imgur.com/YourLogo.png" alt="InvestCoop Logo" style="width: 150px; margin-bottom: 20px;">
              <h1 style="color: #238636; margin: 0; font-size: 28px;">InvestCoop</h1>
              <p style="color: #666; font-size: 16px; margin-top: 10px;">Restablecimiento de Contraseña</p>
            </div>
            
            <div style="margin-bottom: 30px;">
              <p style="color: #444; font-size: 16px; line-height: 24px;">Hola,</p>
              <p style="color: #444; font-size: 16px; line-height: 24px;">Has solicitado restablecer tu contraseña. Usa el siguiente código de verificación:</p>
            </div>
            
            <div style="background: linear-gradient(135deg, #238636 0%, #1a6329 100%); border-radius: 6px; padding: 20px; text-align: center; margin-bottom: 30px;">
              <h2 style="color: #ffffff; letter-spacing: 8px; font-size: 36px; margin: 0; text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">${code}</h2>
            </div>
            
            <div style="margin-bottom: 30px;">
              <p style="color: #666; font-size: 14px; line-height: 21px;">⚠️ Este código expirará en 1 hora por razones de seguridad.</p>
              <p style="color: #666; font-size: 14px; line-height: 21px;">🔒 Si no solicitaste este código, puedes ignorar este correo.</p>
            </div>
            
            <div style="border-top: 1px solid #e6ebf1; padding-top: 20px;">
              <p style="color: #666; font-size: 12px; line-height: 18px; margin: 0; text-align: center;">
                Este es un correo automático, por favor no respondas a este mensaje.<br>
                © ${new Date().getFullYear()} InvestCoop. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error al enviar código de verificación:', error);
    throw error;
  }
};

module.exports = { sendOTP, sendVerificationCode }; 