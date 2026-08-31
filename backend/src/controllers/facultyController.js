import { query } from '../config/db.js';

/**
 * Listar todas las facultades y planteles de la UAEMex
 */
export const getAllFaculties = async (req, res, next) => {
  try {
    const result = await query('SELECT * FROM faculties ORDER BY campus_zone, name ASC');
    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
