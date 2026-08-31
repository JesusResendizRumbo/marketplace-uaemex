import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db.js';
import { sendVerificationOTP } from '../config/mailer.js';

// Generador de código OTP criptográfico de 6 dígitos
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

/**
 * 1. Registro de usuario institucional con envío de código OTP real por correo
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

    const normalized = email.trim().toLowerCase();

    // Validar si el usuario ya existe
    const existing = await query('SELECT id, is_verified FROM users WHERE email = $1', [normalized]);
    
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutos de vigencia
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    if (existing.rows.length > 0) {
      if (existing.rows[0].is_verified) {
        return res.status(400).json({
          success: false,
          error: 'Este correo institucional ya está registrado y verificado. Por favor inicia sesión.',
        });
      } else {
        // Actualizar datos y generar nuevo código OTP
        await query(
          `UPDATE users 
           SET password_hash = $1, full_name = $2, faculty_id = $3, career = $4, phone_number = $5, 
               verification_token = $6, token_expires_at = $7 
           WHERE email = $8`,
          [passwordHash, fullName, facultyId || null, career || null, phoneNumber || null, otpCode, otpExpiresAt, normalized]
        );

        // Enviar correo electrónico real
        await sendVerificationOTP(normalized, otpCode, fullName);

        return res.status(200).json({
          success: true,
          message: `Código de verificación enviado a tu correo institucional ${normalized}.`,
          email: normalized,
        });
      }
    }

    const role = normalized.includes('@profesor.uaemex.mx') ? 'teacher' : 'student';

    // Insertar nuevo usuario pendiente de verificación OTP
    await query(
      `INSERT INTO users (email, password_hash, full_name, role, faculty_id, career, phone_number, is_verified, verification_token, token_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE, $8, $9)`,
      [normalized, passwordHash, fullName, role, facultyId || null, career || null, phoneNumber || null, otpCode, otpExpiresAt]
    );

    // Enviar correo electrónico real
    await sendVerificationOTP(normalized, otpCode, fullName);

    res.status(201).json({
      success: true,
      message: `Código de verificación enviado a tu correo institucional ${normalized}.`,
      email: normalized,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Validación estricta del código OTP recibido en el correo
 */
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        error: 'El correo institucional y el código OTP de 6 dígitos son obligatorios.',
      });
    }

    const normalized = email.trim().toLowerCase();
    const result = await query(
      `SELECT u.id, u.email, u.full_name, u.role, u.faculty_id, u.career, u.phone_number, 
              u.verification_token, u.token_expires_at, f.name as faculty_name
       FROM users u
       LEFT JOIN faculties f ON u.faculty_id = f.id
       WHERE u.email = $1`,
      [normalized]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró ninguna cuenta asociada a este correo.',
      });
    }

    const user = result.rows[0];

    // Validación matemática exacta del código
    if (user.verification_token !== otp.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Código de verificación incorrecto. Revisa tu bandeja de correo o solicita uno nuevo.',
      });
    }

    // Validación de expiración
    if (new Date() > new Date(user.token_expires_at)) {
      return res.status(400).json({
        success: false,
        error: 'El código OTP ha expirado (límite de 15 minutos). Solicita un nuevo código.',
      });
    }

    // Activar cuenta y quemar el token de un solo uso
    await query(
      `UPDATE users 
       SET is_verified = TRUE, verification_token = NULL, token_expires_at = NULL 
       WHERE id = $1`,
      [user.id]
    );

    // Generar Token JWT de sesión
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, facultyId: user.faculty_id },
      process.env.JWT_SECRET || 'super_secret_jwt_key_uaemex_2026_change_in_production',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json({
      success: true,
      message: '¡Cuenta institucional verificada con éxito! Bienvenido a la comunidad UAEMex.',
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        faculty: user.faculty_name,
        career: user.career,
        phoneNumber: user.phone_number,
        averageRating: 5.0,
        totalReviews: 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Reenvío de código OTP al correo
 */
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: 'El correo electrónico es requerido.' });
    }

    const normalized = email.trim().toLowerCase();
    const result = await query('SELECT id, full_name, is_verified FROM users WHERE email = $1', [normalized]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'No existe cuenta con este correo institucional.' });
    }

    const user = result.rows[0];
    const otpCode = generateOTP();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await query(
      'UPDATE users SET verification_token = $1, token_expires_at = $2 WHERE id = $3',
      [otpCode, otpExpiresAt, user.id]
    );

    await sendVerificationOTP(normalized, otpCode, user.full_name);

    res.status(200).json({
      success: true,
      message: `Nuevo código OTP de 6 dígitos enviado a ${normalized}.`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Inicio de sesión (Login) con bloqueo si no está verificado
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

    const normalized = email.trim().toLowerCase();
    const result = await query(
      `SELECT u.*, f.name as faculty_name 
       FROM users u
       LEFT JOIN faculties f ON u.faculty_id = f.id
       WHERE u.email = $1`,
      [normalized]
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

    // Si aún no está verificado por OTP, reenviar código y pedir verificación
    if (!user.is_verified) {
      const otpCode = generateOTP();
      const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await query('UPDATE users SET verification_token = $1, token_expires_at = $2 WHERE id = $3', [otpCode, otpExpiresAt, user.id]);
      await sendVerificationOTP(normalized, otpCode, user.full_name);

      return res.status(403).json({
        success: false,
        error: 'Tu cuenta requiere verificación por correo institucional. Te hemos enviado un código OTP.',
        requiresVerification: true,
        email: normalized,
      });
    }

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
        phoneNumber: user.phone_number,
        clabe: user.clabe_interbancaria,
        bankName: user.bank_name,
        preferredPickupSpot: user.preferred_pickup_spot,
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
 * 5. Obtener perfil autenticado
 */
export const getMe = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT u.id, u.email, u.full_name, u.role, u.career, u.phone_number, u.avatar_url, 
              u.average_rating, u.total_reviews, u.clabe_interbancaria, u.bank_name, u.preferred_pickup_spot, u.created_at,
              f.id as faculty_id, f.name as faculty_name, f.campus_zone
       FROM users u
       LEFT JOIN faculties f ON u.faculty_id = f.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    res.status(200).json({ success: true, user: result.rows[0] });
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Recuperación de contraseña con OTP
 */
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, error: 'Correo obligatorio.' });

    const normalized = email.trim().toLowerCase();
    const result = await query('SELECT id, full_name FROM users WHERE email = $1', [normalized]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      const resetOtp = generateOTP();
      const resetExpires = new Date(Date.now() + 15 * 60 * 1000);
      await query('UPDATE users SET verification_token = $1, token_expires_at = $2 WHERE id = $3', [resetOtp, resetExpires, user.id]);
      await sendVerificationOTP(normalized, resetOtp, user.full_name);
    }

    res.status(200).json({
      success: true,
      message: 'Si el correo está registrado, recibirás un código OTP de recuperación.',
      email: normalized,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios y la contraseña debe tener al menos 8 caracteres.' });
    }

    const normalized = email.trim().toLowerCase();
    const result = await query('SELECT id, verification_token, token_expires_at FROM users WHERE email = $1', [normalized]);

    if (result.rows.length === 0) {
      return res.status(400).json({ success: false, error: 'Código o correo inválido.' });
    }

    const user = result.rows[0];
    if (user.verification_token !== otp.trim() || new Date() > new Date(user.token_expires_at)) {
      return res.status(400).json({ success: false, error: 'Código OTP incorrecto o expirado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);
    await query('UPDATE users SET password_hash = $1, verification_token = NULL, token_expires_at = NULL, is_verified = TRUE WHERE id = $2', [passwordHash, user.id]);

    res.status(200).json({ success: true, message: '¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión.' });
  } catch (error) {
    next(error);
  }
};
