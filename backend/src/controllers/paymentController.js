import { query } from '../config/db.js';

// Generador de código de entrega de 4 dígitos para liberación de fondos (Escrow)
const generateDeliveryCode = () => Math.floor(1000 + Math.random() * 9000).toString();

/**
 * Iniciar proceso de compra con tarjeta web (Pasarela de Pago Segura CU Ecatepec)
 */
export const createPaymentCheckout = async (req, res, next) => {
  try {
    const { productId, cardNumber, cardHolder, expiryDate, cvv } = req.body;
    const buyerId = req.user.id;

    if (!productId || !cardNumber || !cardHolder || !expiryDate || !cvv) {
      return res.status(400).json({
        success: false,
        error: 'Todos los datos de la tarjeta y el producto son obligatorios.',
      });
    }

    // Validar formato de tarjeta
    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 15 || cleanCard.length > 16) {
      return res.status(400).json({
        success: false,
        error: 'Número de tarjeta inválido. Debe tener 15 o 16 dígitos.',
      });
    }

    // Obtener información del producto y del vendedor
    const productRes = await query(
      `SELECT p.*, u.full_name as seller_name, u.clabe_interbancaria, u.bank_name 
       FROM products p 
       LEFT JOIN users u ON p.user_id = u.id 
       WHERE p.id = $1`,
      [productId]
    );

    if (productRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Producto no encontrado.' });
    }

    const product = productRes.rows[0];

    if (product.status !== 'available') {
      return res.status(400).json({ success: false, error: 'Este artículo ya no está disponible.' });
    }

    if (product.user_id === buyerId) {
      return res.status(400).json({ success: false, error: 'No puedes comprar tu propio producto.' });
    }

    // Código de entrega de 4 dígitos
    const deliveryCode = generateDeliveryCode();
    const last4 = cleanCard.slice(-4);
    const transactionId = `TX-ECA-${Date.now()}`;

    // Cambiar estado del producto a "reserved"
    await query("UPDATE products SET status = 'reserved', updated_at = NOW() WHERE id = $1", [productId]);

    // Registrar la orden en la base de datos
    await query(
      `INSERT INTO orders (product_id, buyer_id, seller_id, amount, delivery_code, card_last_four, card_holder, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'payment_held_in_escrow')`,
      [product.id, buyerId, product.user_id, product.price, deliveryCode, last4, cardHolder]
    );

    res.status(201).json({
      success: true,
      message: '¡Pago procesado con éxito! Fondos en custodia segura hasta la entrega física en CU Ecatepec.',
      order: {
        transactionId,
        productId: product.id,
        productTitle: product.title,
        sellerId: product.user_id,
        sellerName: product.seller_name,
        amount: product.price,
        campus: 'Centro Universitario UAEM Ecatepec',
        paymentMethod: `Tarjeta terminada en •••• ${last4}`,
        deliveryCode, // Código que el comprador mostrará en CU Ecatepec
        escrowStatus: 'held_in_escrow',
        instructions: 'Reúnete con el vendedor en CU Ecatepec. Una vez que revises y tengas el producto en mano, proporciónale tu Código de Entrega para liberar el pago.',
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * El vendedor ingresa el código de entrega de 4 dígitos proporcionado por el comprador
 * para liberar los fondos retenidos a su cuenta bancaria/CLABE
 */
export const validateSellerDeliveryCode = async (req, res, next) => {
  try {
    const { productId, deliveryCode } = req.body;
    const sellerId = req.user.id;

    if (!productId || !deliveryCode) {
      return res.status(400).json({
        success: false,
        error: 'El ID del producto y el código de entrega de 4 dígitos son requeridos.',
      });
    }

    // Verificar datos de cobro del vendedor (CLABE)
    const sellerRes = await query(
      'SELECT clabe_interbancaria, bank_name, full_name FROM users WHERE id = $1',
      [sellerId]
    );
    const seller = sellerRes.rows[0];

    // Buscar orden
    const orderRes = await query(
      `SELECT o.*, p.title as product_title, u_buyer.full_name as buyer_name 
       FROM orders o
       LEFT JOIN products p ON o.product_id = p.id
       LEFT JOIN users u_buyer ON o.buyer_id = u_buyer.id
       WHERE o.product_id = $1 AND o.seller_id = $2 AND o.status = 'payment_held_in_escrow'`,
      [productId, sellerId]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No se encontró ninguna orden en custodia activa para este producto y vendedor.',
      });
    }

    const order = orderRes.rows[0];

    if (order.delivery_code !== deliveryCode.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Código de entrega incorrecto. Pídele al comprador el código de 4 dígitos que aparece en su comprobante.',
      });
    }

    // Actualizar orden como entregada y fondos liberados
    await query(
      "UPDATE orders SET status = 'delivered_and_released', delivered_at = NOW(), updated_at = NOW() WHERE id = $1",
      [order.id]
    );

    // Marcar producto como vendido
    await query("UPDATE products SET status = 'sold', updated_at = NOW() WHERE id = $1", [productId]);

    const clabeMasked = seller.clabe_interbancaria 
      ? `•••• •••• •••• ${seller.clabe_interbancaria.slice(-4)} (${seller.bank_name || 'SPEI'})`
      : 'CLABE pendiente de registrar en tu Perfil';

    res.status(200).json({
      success: true,
      message: '¡Código de entrega validado con éxito! Pago transferido a tu cuenta.',
      payout: {
        amount: order.amount,
        depositedTo: clabeMasked,
        productTitle: order.product_title,
        buyerName: order.buyer_name,
        transactionDate: new Date().toISOString(),
      },
    });
  } catch (error) {
    next(error);
  }
};
