/**
 * Middleware para validar que el correo electrónico pertenezca a los dominios autorizados de la UAEMex
 */
export const ALLOWED_UAEMEX_DOMAINS = [
  '@alumno.uaemex.mx',
  '@alumnos.uaemex.mx',
  '@egresado.uaemex.mx',
  '@egresados.uaemex.mx',
  '@profesor.uaemex.mx',
  '@profesores.uaemex.mx',
  '@comunidad.uaemex.mx',
  '@uaemex.mx',
];

export const validateUAEMexEmail = (req, res, next) => {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      success: false,
      error: 'El correo electrónico es un campo obligatorio.',
    });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const isValidDomain = 
    ALLOWED_UAEMEX_DOMAINS.some(domain => normalizedEmail.endsWith(domain)) ||
    normalizedEmail.endsWith('.uaemex.mx');

  if (!isValidDomain) {
    return res.status(400).json({
      success: false,
      error: 'Dominio no institucional. Se permiten correos oficiales de la UAEMex (@alumno, @egresado, @profesor o @uaemex.mx).',
    });
  }

  req.body.email = normalizedEmail;
  next();
};
