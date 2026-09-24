import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del transporte de correo con soporte para Brevo / Gmail y timeout seguro
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp-relay.brevo.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000, // Máximo 5s de espera para evitar que la página se quede congelada
  greetingTimeout: 5000,
  socketTimeout: 8000,
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Envía el código de verificación OTP por correo institucional
 * @param {string} toEmail - Correo del destinatario (@alumno.uaemex.mx)
 * @param {string} otpCode - Código de 6 dígitos
 * @param {string} userName - Nombre del estudiante/docente
 */
export const sendVerificationOTP = async (toEmail, otpCode, userName = 'Universitario') => {
  // Si no hay credenciales SMTP configuradas, imprimimos en consola
  if (!process.env.EMAIL_USER || process.env.EMAIL_USER.includes('tu_correo')) {
    console.log('\n======================================================');
    console.log(`✉️ [MODO DEV - SIMULADOR DE CORREO UAEMEX]`);
    console.log(`Para: ${toEmail}`);
    console.log(`Destinatario: ${userName}`);
    console.log(`🔑 CÓDIGO OTP DE VERIFICACIÓN: [ ${otpCode} ]`);
    console.log(`Válido durante 15 minutos`);
    console.log('======================================================\n');
    return true;
  }

  const senderEmail = process.env.EMAIL_USER;
  const mailOptions = {
    from: process.env.EMAIL_FROM || `"PotroTrade UAEMex" <${senderEmail}>`,
    to: toEmail,
    subject: `🎓 Tu Código de Verificación PotroTrade: ${otpCode}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #004d26; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; color: #e5a823; font-weight: 800;">PotroTrade • UAEMex</h1>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Comunidad Universitaria Segura • CU Ecatepec</p>
        </div>
        
        <div style="padding: 32px 24px; color: #334155;">
          <h2 style="margin-top: 0; color: #004d26; font-size: 20px;">¡Hola, ${userName}!</h2>
          <p style="font-size: 15px; line-height: 1.6;">
            Gracias por unirte a la plataforma oficial de compraventa e intercambio de CU UAEM Ecatepec.
          </p>
          <p style="font-size: 15px; line-height: 1.6;">
            Para activar tu cuenta, ingresa el siguiente código de seguridad en la aplicación:
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #004d26; border-radius: 8px; padding: 14px 28px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #004d26;">
              ${otpCode}
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Este código expira en 15 minutos.</p>
          </div>
        </div>

        <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Patria, Ciencia y Trabajo • Universidad Autónoma del Estado de México
        </div>
      </div>
    `,
  };

  try {
    return await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('❌ Error enviando correo por SMTP Brevo:', error.message);
    return false;
  }
};

export default transporter;
