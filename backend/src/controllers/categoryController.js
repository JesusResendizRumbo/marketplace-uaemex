import { query } from '../config/db.js';

/**
 * Listar todas las categorías de productos
 */
export const getAllCategories = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM categories ORDER BY name ASC');
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
