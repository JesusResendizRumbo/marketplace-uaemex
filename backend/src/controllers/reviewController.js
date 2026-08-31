import { query } from '../config/db.js';

/**
 * Enviar reseña a un vendedor
 */
export const createReview = async (req, res, next) => {
  try {
    const { productId, targetUserId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    if (!targetUserId || !rating) {
      return res.status(400).json({ success: false, error: 'El vendedor y la calificación (1-5) son obligatorios.' });
    }

    if (reviewerId === targetUserId) {
      return res.status(400).json({ success: false, error: 'No puedes calificarte a ti mismo.' });
    }

    const numRating = parseInt(rating);
    if (numRating < 1 || numRating > 5) {
      return res.status(400).json({ success: false, error: 'La calificación debe estar entre 1 y 5 estrellas.' });
    }

    const sql = `
      INSERT INTO reviews (product_id, reviewer_id, target_user_id, rating, comment)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const result = await query(sql, [productId || null, reviewerId, targetUserId, numRating, comment || null]);

    res.status(201).json({
      success: true,
      message: '¡Gracias por calificar tu experiencia!',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener reseñas recibidas por un usuario
 */
export const getUserReviews = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const sql = `
      SELECT 
        r.*,
        u.full_name as reviewer_name, u.avatar_url as reviewer_avatar
      FROM reviews r
      LEFT JOIN users u ON r.reviewer_id = u.id
      WHERE r.target_user_id = $1
      ORDER BY r.created_at DESC
    `;

    const result = await query(sql, [userId]);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
