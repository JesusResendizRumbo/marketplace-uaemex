import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { sendVerificationOTP } from '../config/mailer.js';

// Generador de código OTP de 6 dígitos
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Registro de nuevo usuario universitario
 */
export const register = async (req, res, next) => {
  try {
    const { email, password, fullName, facultyId, career, phoneNumber } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'La contraseña debe tener al menos 8 caracteres.',
      });
    }

    if (!fullName) {
      return res.status(400).json({
        success: false,
        error: 'El nombre completo es obligatorio.',
      });
    }

    // Verificar si el correo ya está registrado
    const existing = await query('SELECT id, is_verified FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      if (existing.rows[0].is_verified) {
        return res.status(400).json({
          success: false,
          error: 'Este correo institucional ya está registrado y verificado. Por favor inicia sesión.',
        });
      } else {
        // Si no está verificado, actualizamos contraseña y generamos nuevo OTP
        const otpCode = generateOTP();
        const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        await query(
          `UPDATE users 
           SET password_hash = $1, full_name = $2, faculty_id = $3, career = $4, phone_number = $5, 
               verification_token = $6, token_expires_at = $7 
           WHERE email = $8`,
          [passwordHash, fullName, facultyId || null, career || null, phoneNumber || null, otpCode, otpExpiresAt, email]
        );

        await sendVerificationOTP(email, otpCode, fullName);

        return res.status(200).json({
          success: true,
          message: 'Tu cuenta estaba pendiente de verificación. Te hemos reenviado un nuevo código OTP.',
          email,
        });
      }
    }

    // Hash de contraseña
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Generar OTP
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos

    // Determinar rol inicial (docente o estudiante según correo)
    const role = email.includes('@profesor.uaemex.mx') ? 'teacher' : 'student';

    const insertResult = await query(
      `INSERT INTO users (email, password_hash, full_name, role, faculty_id, career, phone_number, is_verified, verification_token, token_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, $8, $9)
       RETURNING id, email, full_name, role, created_at`,
      [email, passwordHash, fullName, role, facultyId || null, career || null, phoneNumber || null, otpCode, otpExpiresAt]
    );

    // Enviar código por correo
    await sendVerificationOTP(email, otpCode, fullName);

    res.status(201).json({
      success: true,
      message: 'Registro exitoso. Se ha enviado un código de verificación a tu correo institucional.',
      user: insertResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Verificación del código OTP
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'El correo y el código OTP son requeridos.',
      });
    }

    const result = await query(
      `SELECT u.id, u.email, u.full_name, u.role, u.faculty_id, u.verification_token, u.token_expires_at, f.name as faculty_name
       FROM users u
       LEFT JOIN faculties f ON u.faculty_id = f.id
       WHERE u.email = $1`,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró ninguna cuenta asociada a este correo.',
      });
    }

    const user = result.rows[0];

    if (user.verification_token !== otp.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Código de verificación incorrecto.',
      });
    }

    if (new Date() > new Date(user.token_expires_at)) {
      return res.status(400).json({
        success: false,
        error: 'El código OTP ha expirado. Por favor solicita uno nuevo.',
      });
    }

    // Activar usuario
    await query(
      `UPDATE users 
       SET is_verified = TRUE, verification_token = NULL, token_expires_at = NULL 
       WHERE id = $1`,
      [user.id]
    );

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, facultyId: user.faculty_id },
      process.env.JWT_SECRET || 'super_secret_jwt_key_uaemex_2026_change_in_production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: '¡Cuenta verificada exitosamente! Bienvenido a la comunidad UAEMex.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        faculty: user.faculty_name,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Inicio de sesión (Login)
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor ingresa tu correo institucional y contraseña.',
      });
    }

    const result = await query(
      `SELECT u.*, f.name as faculty_name 
       FROM users u
       LEFT JOIN faculties f ON u.faculty_id = f.id
       WHERE u.email = $1`,
      [email.trim().toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas. Por favor verifica tus datos.',
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas. Por favor verifica tus datos.',
      });
    }

    if (!user.is_verified) {
      // Reenviar OTP automáticamente si no está verificado
      const newOtp = generateOTP();
      const otpExpires = new Date(Date.now() + 15 * 60 * 1000);
      await query('UPDATE users SET verification_token = $1, token_expires_at = $2 WHERE id = $3', [newOtp, otpExpires, user.id]);
      await sendVerificationOTP(user.email, newOtp, user.full_name);

      return res.status(403).json({
        success: false,
        error: 'Tu cuenta aún no está verificada. Te hemos enviado un nuevo código OTP a tu correo institucional.',
        requiresVerification: true,
        email: user.email,
      });
    }

    // Generar JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, facultyId: user.faculty_id },
      process.env.JWT_SECRET || 'super_secret_jwt_key_uaemex_2026_change_in_production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        faculty: user.faculty_name,
        career: user.career,
        avatarUrl: user.avatar_url,
        averageRating: parseFloat(user.average_rating) || 5.0,
        totalReviews: user.total_reviews || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Solicitar recuperación de contraseña (envío de código OTP)
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'El correo electrónico es requerido.' });
    }

    const normalized = email.trim().toLowerCase();
    const result = await query('SELECT id, full_name, email FROM users WHERE email = $1', [normalized]);

    if (result.rows.length === 0) {
      // Por seguridad para no revelar existencia de cuentas
      return res.status(200).json({
        success: true,
        message: 'Si el correo está registrado en la comunidad UAEMex, recibirás un código de recuperación.',
      });
    }

    const user = result.rows[0];
    const resetOtp = generateOTP();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    await query(
      'UPDATE users SET verification_token = $1, token_expires_at = $2 WHERE id = $3',
      [resetOtp, resetExpires, user.id]
    );

    await sendVerificationOTP(user.email, resetOtp, user.full_name);

    res.status(200).json({
      success: true,
      message: 'Código de recuperación enviado a tu correo institucional.',
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Restablecer contraseña con código OTP
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos son obligatorios (correo, código OTP y nueva contraseña).',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        error: 'La nueva contraseña debe tener al menos 8 caracteres.',
      });
    }

    const normalized = email.trim().toLowerCase();
    const result = await query(
      'SELECT id, verification_token, token_expires_at FROM users WHERE email = $1',
      [normalized]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Código o usuario inválido.' });
    }

    const user = result.rows[0];

    if (user.verification_token !== otp.trim()) {
      return res.status(400).json({ success: false, error: 'Código de recuperación incorrecto.' });
    }

    if (new Date() > new Date(user.token_expires_at)) {
      return res.status(400).json({ success: false, error: 'El código OTP ha expirado. Solicita uno nuevo.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    await query(
      'UPDATE users SET password_hash = $1, verification_token = NULL, token_expires_at = NULL, is_verified = TRUE WHERE id = $2',
      [passwordHash, user.id]
    );

    res.status(200).json({
      success: true,
      message: '¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión.',
    });
  } catch (error) {
    next(error);
  }
};
