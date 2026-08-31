import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del transporte de correo con soporte para Brevo y timeout seguro
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000, // Máximo 5s para que la página jamás se quede congelada
  greetingTimeout: 5000,
  socketTimeout: 8000,
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Envía el código de verificación OTP por correo institucional
 */
export const sendVerificationOTP = async (toEmail, otpCode, userName = 'Universitario') => {
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('tu_correo')) {
    console.log(`🔑 CÓDIGO OTP: [ ${otpCode} ] para ${toEmail}`);
    return true;
  }

  const senderEmail = process.env.EMAIL_USER;
  const mailOptions = {
    from: process.env.EMAIL_FROM || `"Marketplace UAEMex" <${senderEmail}>`,
    to: toEmail,
    subject: `🎓 Tu Código de Verificación UAEMex: ${otpCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #004d26; padding: 20px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; color: #e5a823;">Marketplace Universitario UAEMex</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px;">CU UAEM Ecatepec</p>
        </div>
        <div style="padding: 24px; color: #334155;">
          <h2 style="color: #004d26;">¡Hola, ${userName}!</h2>
          <p>Tu código de seguridad para acceder a la plataforma es:</p>
          <div style="text-align: center; margin: 24px 0;">
            <span style="display: inline-block; background-color: #f8fafc; border: 2px dashed #004d26; padding: 12px 24px; font-size: 30px; font-weight: 700; letter-spacing: 6px; color: #004d26;">
              ${otpCode}
            </span>
          </div>
          <p style="font-size: 12px; color: #64748b;">Válido durante 15 minutos.</p>
        </div>
      </div>
    `,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Error enviando correo:', error.message);
    return false;
  }
};

export default transporter;
