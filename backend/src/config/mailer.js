import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Configuración del transporte de correo
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_PORT === '465',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Envía el código de verificación OTP por correo institucional
 * @param {string} toEmail - Correo del destinatario (@alumno.uaemex.mx)
 * @param {string} otpCode - Código de 6 dígitos
 * @param {string} userName - Nombre del estudiante/docente
 */
export const sendVerificationOTP = async (toEmail, otpCode, userName = 'Universitario') => {
  // Si no hay credenciales SMTP configuradas en entorno de desarrollo, imprimimos en consola
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

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"Marketplace UAEMex" <noreply@uaemex.mx>',
    to: toEmail,
    subject: `🎓 Tu Código de Verificación UAEMex: ${otpCode}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
        <div style="background-color: #004d26; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; color: #e5a823; font-weight: 800;">Marketplace Universitario UAEMex</h1>
          <p style="margin: 6px 0 0 0; font-size: 14px; opacity: 0.9;">Comunidad Universitaria Segura</p>
        </div>
        
        <div style="padding: 32px 24px; color: #334155;">
          <h2 style="margin-top: 0; color: #004d26; font-size: 20px;">¡Hola, ${userName}!</h2>
          <p style="font-size: 15px; line-height: 1.6;">
            Gracias por unirte a la plataforma oficial de intercambio y compraventa entre la comunidad verde y oro.
          </p>
          <p style="font-size: 15px; line-height: 1.6;">
            Para validar tu identidad y activar tu cuenta, ingresa el siguiente código de seguridad en la aplicación:
          </p>
          
          <div style="text-align: center; margin: 32px 0;">
            <div style="display: inline-block; background-color: #f8fafc; border: 2px dashed #004d26; border-radius: 8px; padding: 14px 28px; font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #004d26;">
              ${otpCode}
            </div>
            <p style="font-size: 12px; color: #64748b; margin-top: 8px;">Este código expira en 15 minutos.</p>
          </div>

          <p style="font-size: 13px; color: #94a3b8; line-height: 1.5; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            Si tú no solicitaste este registro con tu correo institucional <strong>${toEmail}</strong>, por favor ignora este mensaje.
          </p>
        </div>

        <div style="background-color: #f8fafc; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
          Patria, Ciencia y Trabajo • Universidad Autónoma del Estado de México
        </div>
      </div>
    `,
  };

  return transporter.sendMail(mailOptions);
};

export default transporter;
