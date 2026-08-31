import { query } from '../config/db.js';

/**
 * Listar reportes de Objetos Perdidos y Encontrados
 */
export const getAllLostItems = async (req, res, next) => {
  try {
    const { type, facultyId, status = 'open', search } = req.query;

    const conditions = [];
    const values = [];

    if (type) {
      values.push(type);
      conditions.push(`l.type = $${values.length}`);
    }

    if (facultyId) {
      values.push(facultyId);
      conditions.push(`l.faculty_id = $${values.length}`);
    }

    if (status !== 'all') {
      values.push(status);
      conditions.push(`l.status = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(l.title ILIKE $${values.length} OR l.description ILIKE $${values.length} OR l.location_details ILIKE $${values.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const sql = `
      SELECT 
        l.*,
        f.name as faculty_name, f.campus_zone,
        u.full_name as reporter_name, u.email as reporter_email
      FROM lost_items l
      LEFT JOIN faculties f ON l.faculty_id = f.id
      LEFT JOIN users u ON l.user_id = u.id
      ${whereClause}
      ORDER BY l.created_at DESC
    `;

    const result = await query(sql, values);

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear reporte de objeto perdido / encontrado
 */
export const createLostItem = async (req, res, next) => {
  try {
    const { title, description, locationDetails, eventDate, type, facultyId, images } = req.body;
    const userId = req.user.id;

    if (!title || !description || !locationDetails || !eventDate || !type || !facultyId) {
      return res.status(400).json({
        success: false,
        error: 'Todos los campos marcados son obligatorios (título, descripción, ubicación, fecha, tipo y facultad).',
      });
    }

    const sql = `
      INSERT INTO lost_items (user_id, faculty_id, title, description, location_details, event_date, type, images, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'open')
      RETURNING *
    `;

    const result = await query(sql, [
      userId,
      facultyId,
      title,
      description,
      locationDetails,
      eventDate,
      type,
      Array.isArray(images) ? images : [],
    ]);

    res.status(201).json({
      success: true,
      message: 'Reporte registrado exitosamente.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resolver o cerrar un reporte de objeto perdido
 */
export const resolveLostItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const check = await query('SELECT user_id FROM lost_items WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Reporte no encontrado.' });
    }

    if (check.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'No tienes permiso para actualizar este reporte.' });
    }

    const result = await query(
      `UPDATE lost_items 
       SET status = 'resolved', resolved_at = NOW(), updated_at = NOW() 
       WHERE id = $1 RETURNING *`,
      [id]
    );

    res.status(200).json({
      success: true,
      message: 'Reporte marcado como resuelto / entregado.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
