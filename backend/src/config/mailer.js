import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Envía el código de verificación OTP por correo institucional.
 * Soporta despacho por HTTPS (Google Apps Script Webhook) para saltar el bloqueo de puertos SMTP de Render.
 */
export const sendVerificationOTP = async (toEmail, otpCode, userName = 'Universitario') => {
  const emailSubject = `🎓 Tu Código de Verificación PotroTrade: ${otpCode}`;
  const htmlContent = `
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
  `;

  // MÉTODO 1 (Recomendado para Render Free): Webhook HTTPS (Puerto 443 sin bloqueos)
  const webhookUrl = process.env.GMAIL_WEBHOOK_URL;
  if (webhookUrl && webhookUrl.startsWith('https://script.google.com')) {
    try {
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toEmail,
          subject: emailSubject,
          html: htmlContent,
        }),
      });
      console.log('✅ Correo OTP despachado vía Google Apps Script HTTPS (Status:', resp.status, ')');
      return true;
    } catch (err) {
      console.error('⚠️ Error enviando vía Google Webhook:', err.message);
    }
  }

  // MÉTODO 2: SMTP Clásico (Fallback)
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });
    const senderEmail = process.env.EMAIL_USER || 'jesusresendizrumbo@gmail.com';
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"PotroTrade UAEMex" <${senderEmail}>`,
      to: toEmail,
      subject: emailSubject,
      html: htmlContent,
    });
    console.log('✅ Correo OTP enviado vía SMTP:', info.response);
    return true;
  } catch (error) {
    console.error('❌ Error enviando correo por SMTP:', error.message);
    return false;
  }
};

/**
 * Notifica por correo al vendedor o usuario que ha recibido un mensaje nuevo en su publicación
 */
export const sendMessageNotificationEmail = async (toEmail, recipientName = 'Universitario', senderName = 'Compañero UAEMex', productTitle = 'Artículo', messageText = '') => {
  const emailSubject = `💬 Nuevo mensaje de ${senderName} sobre "${productTitle}" • PotroTrade`;
  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
      <div style="background-color: #004d26; padding: 22px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 22px; color: #e5a823; font-weight: 800;">PotroTrade • UAEMex</h1>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Centro Universitario UAEM Ecatepec</p>
      </div>
      <div style="padding: 26px 24px; color: #334155;">
        <h2 style="color: #004d26; margin-top: 0; font-size: 18px;">¡Hola, ${recipientName}!</h2>
        <p style="font-size: 14px; line-height: 1.5; color: #475569;">
          Un alumno de <strong>CU Ecatepec</strong> te ha enviado un mensaje sobre tu publicación:
        </p>
        <div style="background-color: #f8fafc; border-left: 4px solid #004d26; padding: 14px 18px; margin: 18px 0; border-radius: 6px;">
          <div style="font-weight: 800; color: #0f172a; font-size: 15px;">📦 ${productTitle}</div>
          <div style="margin-top: 8px; font-size: 14px; color: #1e293b; font-style: italic;">
            "${messageText}"
          </div>
          <div style="margin-top: 8px; font-size: 12px; color: #64748b;">
            Enviado por: <strong>${senderName}</strong>
          </div>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <a href="https://marketplace-uaemex.vercel.app" style="background-color: #004d26; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 14px; display: inline-block;">
            Abrir PotroTrade y Responder
          </a>
        </div>
        <p style="font-size: 12px; color: #94a3b8; margin-top: 24px; text-align: center;">
          Recuerda acordar siempre las entregas en puntos seguros dentro de CU Ecatepec.
        </p>
      </div>
      <div style="background-color: #f8fafc; padding: 12px; text-align: center; font-size: 11px; color: #64748b; border-top: 1px solid #e2e8f0;">
        Patria, Ciencia y Trabajo • CU UAEM Ecatepec
      </div>
    </div>
  `;

  const webhookUrl = process.env.GMAIL_WEBHOOK_URL;
  if (webhookUrl && webhookUrl.startsWith('https://script.google.com')) {
    try {
      const resp = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: toEmail,
          subject: emailSubject,
          html: htmlContent,
        }),
      });
      return resp.ok;
    } catch (err) {
      console.error('⚠️ Error enviando correo vía webhook:', err.message);
    }
  }

  // Fallback SMTP
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: { rejectUnauthorized: false },
    });
    const senderEmail = process.env.EMAIL_USER || 'jesusresendizrumbo@gmail.com';
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || `"PotroTrade UAEMex" <${senderEmail}>`,
      to: toEmail,
      subject: emailSubject,
      html: htmlContent,
    });
    return true;
  } catch (error) {
    console.error('❌ Error enviando correo por SMTP:', error.message);
    return false;
  }
};

export default sendVerificationOTP;
