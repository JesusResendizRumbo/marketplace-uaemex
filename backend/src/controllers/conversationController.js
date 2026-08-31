import { query } from '../config/db.js';

/**
 * Obtener o iniciar una conversación vinculada a un producto
 */
export const getOrCreateConversation = async (req, res, next) => {
  try {
    const { productId, sellerId } = req.body;
    const buyerId = req.user.id;

    if (buyerId === sellerId) {
      return res.status(400).json({
        success: false,
        error: 'No puedes iniciar una conversación contigo mismo.',
      });
    }

    // Verificar si ya existe una conversación entre estos usuarios para este producto
    const existing = await query(
      `SELECT c.*, p.title as product_title, p.price as product_price, p.images as product_images
       FROM conversations c
       LEFT JOIN products p ON c.product_id = p.id
       WHERE c.product_id = $1 AND c.buyer_id = $2 AND c.seller_id = $3`,
      [productId, buyerId, sellerId]
    );

    if (existing.rows.length > 0) {
      return res.status(200).json({
        success: true,
        conversation: existing.rows[0],
      });
    }

    // Crear nueva conversación
    const createResult = await query(
      `INSERT INTO conversations (product_id, buyer_id, seller_id)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [productId, buyerId, sellerId]
    );

    res.status(201).json({
      success: true,
      conversation: createResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Listar todas las conversaciones del usuario
 */
export const getUserConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const sql = `
      SELECT 
        c.id, c.updated_at,
        p.id as product_id, p.title as product_title, p.price as product_price, p.images as product_images,
        CASE 
          WHEN c.buyer_id = $1 THEN u_seller.full_name
          ELSE u_buyer.full_name
        END as other_user_name,
        CASE 
          WHEN c.buyer_id = $1 THEN u_seller.id
          ELSE u_buyer.id
        END as other_user_id,
        (
          SELECT content 
          FROM messages m 
          WHERE m.conversation_id = c.id 
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message,
        (
          SELECT created_at 
          FROM messages m 
          WHERE m.conversation_id = c.id 
          ORDER BY m.created_at DESC 
          LIMIT 1
        ) as last_message_time
      FROM conversations c
      LEFT JOIN products p ON c.product_id = p.id
      LEFT JOIN users u_buyer ON c.buyer_id = u_buyer.id
      LEFT JOIN users u_seller ON c.seller_id = u_seller.id
      WHERE c.buyer_id = $1 OR c.seller_id = $1
      ORDER BY c.updated_at DESC
    `;

    const result = await query(sql, [userId]);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener mensajes de una conversación
 */
export const getMessages = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Validar pertenencia a la conversación
    const conv = await query(
      'SELECT buyer_id, seller_id FROM conversations WHERE id = $1',
      [id]
    );

    if (conv.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Conversación no encontrada.' });
    }

    if (conv.rows[0].buyer_id !== userId && conv.rows[0].seller_id !== userId) {
      return res.status(403).json({ success: false, error: 'No tienes acceso a esta conversación.' });
    }

    const messages = await query(
      `SELECT m.*, u.full_name as sender_name 
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC`,
      [id]
    );

    // Marcar como leídos
    await query(
      'UPDATE messages SET is_read = TRUE WHERE conversation_id = $1 AND sender_id <> $2',
      [id, userId]
    );

    res.status(200).json({
      success: true,
      data: messages.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Enviar un mensaje
 */
export const sendMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, error: 'El contenido del mensaje no puede estar vacío.' });
    }

    const insertResult = await query(
      `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [id, userId, content.trim()]
    );

    // Actualizar timestamp de la conversación
    await query('UPDATE conversations SET updated_at = NOW() WHERE id = $1', [id]);

    res.status(201).json({
      success: true,
      data: insertResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
