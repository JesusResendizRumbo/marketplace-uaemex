import { query } from '../config/db.js';

/**
 * Listar y filtrar publicaciones de productos
 */
export const getAllProducts = async (req, res, next) => {
  try {
    const { search, category, facultyId, minPrice, maxPrice, condition, status = 'available', page = 1, limit = 12 } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const conditions = [];
    const values = [];

    // Filtro por estatus (por defecto 'available')
    if (status !== 'all') {
      values.push(status);
      conditions.push(`p.status = $${values.length}`);
    }

    // Búsqueda por texto en título o descripción
    if (search) {
      values.push(`%${search}%`);
      conditions.push(`(p.title ILIKE $${values.length} OR p.description ILIKE $${values.length})`);
    }

    // Filtro por categoría (slug o UUID)
    if (category) {
      values.push(category);
      conditions.push(`(c.slug = $${values.length} OR c.id::text = $${values.length})`);
    }

    // Filtro por facultad
    if (facultyId) {
      values.push(facultyId);
      conditions.push(`p.faculty_id = $${values.length}`);
    }

    // Filtro por rango de precio
    if (minPrice) {
      values.push(parseFloat(minPrice));
      conditions.push(`p.price >= $${values.length}`);
    }

    if (maxPrice) {
      values.push(parseFloat(maxPrice));
      conditions.push(`p.price <= $${values.length}`);
    }

    // Filtro por condición del producto
    if (condition) {
      values.push(condition);
      conditions.push(`p.condition = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Contar total
    const countSql = `
      SELECT COUNT(*) 
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const countResult = await query(countSql, values);
    const total = parseInt(countResult.rows[0].count);

    // Consulta de productos
    const sql = `
      SELECT 
        p.id, p.title, p.description, p.price, p.condition, p.status, p.images, p.is_exchangeable, p.views_count, p.created_at,
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        f.id as faculty_id, f.name as faculty_name, f.campus_zone,
        u.id as seller_id, u.full_name as seller_name, u.average_rating as seller_rating, u.total_reviews as seller_reviews
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN faculties f ON p.faculty_id = f.id
      LEFT JOIN users u ON p.user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${values.length + 1} OFFSET $${values.length + 2}
    `;

    const productsResult = await query(sql, [...values, parseInt(limit), offset]);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)) || 1,
      data: productsResult.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener detalle de un producto por ID
 */
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sql = `
      SELECT 
        p.*,
        c.name as category_name, c.slug as category_slug,
        f.name as faculty_name, f.campus_zone,
        u.full_name as seller_name, u.email as seller_email, u.phone_number as seller_phone, 
        u.career as seller_career, u.average_rating as seller_rating, u.total_reviews as seller_reviews,
        u.created_at as seller_member_since
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN faculties f ON p.faculty_id = f.id
      LEFT JOIN users u ON p.user_id = u.id
      WHERE p.id = $1
    `;

    const result = await query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Producto no encontrado.',
      });
    }

    // Incrementar contador de visualizaciones
    await query('UPDATE products SET views_count = views_count + 1 WHERE id = $1', [id]);

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Crear nueva publicación
 */
export const createProduct = async (req, res, next) => {
  try {
    const { title, description, price, categoryId, facultyId, condition, isExchangeable, images } = req.body;
    const userId = req.user.id;

    if (!title || !description || price === undefined || !categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Título, descripción, precio y categoría son campos obligatorios.',
      });
    }

    const sql = `
      INSERT INTO products (user_id, category_id, faculty_id, title, description, price, condition, is_exchangeable, images, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'available')
      RETURNING *
    `;

    const result = await query(sql, [
      userId,
      categoryId,
      facultyId || null,
      title,
      description,
      parseFloat(price) || 0,
      condition || 'good',
      Boolean(isExchangeable),
      Array.isArray(images) ? images : [],
    ]);

    res.status(201).json({
      success: true,
      message: 'Artículo publicado exitosamente.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar estatus de producto (Disponible / Apartado / Vendido)
 */
export const updateProductStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    if (!['available', 'reserved', 'sold', 'hidden'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Estatus inválido. Debe ser: available, reserved, sold o hidden.',
      });
    }

    // Verificar propiedad
    const check = await query('SELECT user_id FROM products WHERE id = $1', [id]);
    if (check.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado.' });
    }

    if (check.rows[0].user_id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'No tienes permiso para modificar este producto.' });
    }

    const result = await query(
      'UPDATE products SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.status(200).json({
      success: true,
      message: `Estatus actualizado a: ${status}`,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
