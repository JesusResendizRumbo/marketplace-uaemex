import jwt from 'jsonwebtoken';

/**
 * Middleware para proteger rutas mediante JSON Web Token (JWT)
 */
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Acceso no autorizado. Se requiere un token de sesión válido.',
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'super_secret_jwt_key_uaemex_2026_change_in_production');
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Token inválido o expirado. Por favor inicia sesión nuevamente.',
    });
  }
};

/**
 * Middleware para verificar rol de Administrador o Moderador
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'moderator')) {
    return res.status(403).json({
      success: false,
      error: 'Acceso denegado. Se requieren privilegios de moderación o administración.',
    });
  }
  next();
};
