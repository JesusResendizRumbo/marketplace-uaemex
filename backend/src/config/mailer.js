import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import dns from 'dns';

// Forzar IPv4 para que la red de Render no falle con Google
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  family: 4, // Conexión estricta IPv4 para Render
  tls: {
    rejectUnauthorized: false,
  },
});

export const sendVerificationOTP = async (toEmail, otpCode, userName = 'Universitario') => {
  const senderEmail = process.env.EMAIL_USER || 'jesusresendizrumbo@gmail.com';
  const mailOptions = {
    from: process.env.EMAIL_FROM || `"PotroTrade UAEMex" <${senderEmail}>`,
    to: toEmail,
    subject: `🎓 Tu Código de Verificación PotroTrade: ${otpCode}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #004d26; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 22px; color: #e5a823; font-weight: 800;">PotroTrade • UAEMex</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Centro Universitario UAEM Ecatepec</p>
        </div>
        <div style="padding: 28px 24px; color: #334155;">
          <h2 style="color: #004d26; margin-top: 0;">¡Hola, ${userName}!</h2>
          <p style="font-size: 14px; line-height: 1.6;">
            Tu código de seguridad para activar tu cuenta institucional en <strong>PotroTrade</strong> es:
          </p>
          <div style="text-align: center; margin: 28px 0;">
            <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #004d26; border-radius: 8px; padding: 14px 28px; font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #004d26;">
              ${otpCode}
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Este código expira en 15 minutos.</p>
          </div>
        </div>
        <div style="background-color: #f8fafc; padding: 14px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Patria, Ciencia y Trabajo • Ecatepec de Morelos, Estado de México
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Correo OTP enviado con éxito a:', toEmail, info.response);
    return info;
  } catch (error) {
    console.error('❌ Error enviando correo por SMTP Gmail:', error.message);
    throw error;
  }
};

export default transporter;
