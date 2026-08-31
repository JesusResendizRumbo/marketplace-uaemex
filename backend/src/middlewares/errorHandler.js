/**
 * Middleware para rutas no encontradas (404)
 */
export const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    error: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
  });
};

/**
 * Middleware central de manejo de errores (500)
 */
export const globalErrorHandler = (err, req, res, next) => {
  console.error('💥 Error global capturado:', err);

  // Manejo de errores específicos de PostgreSQL
  if (err.code === '23505') {
    // Unique violation
    return res.status(409).json({
      success: false,
      error: 'El recurso ya existe o el valor ingresado está duplicado.',
      detail: err.detail,
    });
  }

  if (err.code === '23503') {
    // Foreign key violation
    return res.status(400).json({
      success: false,
      error: 'Referencia inválida (el ID de facultad, categoría o usuario no existe).',
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: err.message || 'Error interno del servidor.',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
