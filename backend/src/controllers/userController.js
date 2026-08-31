import { query } from '../config/db.js';

/**
 * Actualizar perfil del usuario autenticado
 */
export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { fullName, phoneNumber, career, clabe, bankName, preferredPickupSpot } = req.body;

    // Validar CLABE si fue enviada (18 dígitos numéricos en México)
    if (clabe && clabe.trim()) {
      const cleanClabe = clabe.trim().replace(/\s/g, '');
      if (cleanClabe.length !== 18 || !/^\d+$/.test(cleanClabe)) {
        return res.status(400).json({
          success: false,
          error: 'La CLABE Interbancaria debe contener exactamente 18 dígitos numéricos.',
        });
      }
    }

    const sql = `
      UPDATE users
      SET 
        full_name = COALESCE($1, full_name),
        phone_number = COALESCE($2, phone_number),
        career = COALESCE($3, career),
        clabe_interbancaria = COALESCE($4, clabe_interbancaria),
        bank_name = COALESCE($5, bank_name),
        preferred_pickup_spot = COALESCE($6, preferred_pickup_spot),
        updated_at = NOW()
      WHERE id = $7
      RETURNING id, email, full_name, role, career, phone_number, clabe_interbancaria, bank_name, preferred_pickup_spot, average_rating, total_reviews
    `;

    const result = await query(sql, [
      fullName || null,
      phoneNumber || null,
      career || null,
      clabe ? clabe.trim().replace(/\s/g, '') : null,
      bankName || null,
      preferredPickupSpot || null,
      userId
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Usuario no encontrado.' });
    }

    res.status(200).json({
      success: true,
      message: '¡Perfil y cuenta bancaria de cobro actualizados con éxito!',
      user: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};
