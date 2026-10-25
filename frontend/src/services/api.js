const SUPABASE_URL = 'https://iceiljslydfcmpjqnicn.supabase.co';
const SUPABASE_KEY = 'sb_publishable_LrB8XS5Uc1R3-hxGGUiKVg_jSz_e4Cz';

const supabaseHeaders = {
  'apikey': SUPABASE_KEY,
  'Authorization': `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation'
};

const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host.includes('vercel.app')) {
      return 'https://api-marketplace-uaemex.onrender.com/api';
    }
    return `http://${host}:5001/api`;
  }
  return 'http://localhost:5001/api';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Cliente HTTP unificado con soporte para Supabase Directo en la Nube
 */
export const api = {
  // Autenticación institucional
  async register(data) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: 'Código de verificación generado (Modo Demostración).',
        email: data.email,
        simulatedOtp: '123456',
      };
    }
  },

  async verifyOTP(email, otp) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        token: 'token-uaemex-institucional',
        user: {
          id: `user-${Date.now()}`,
          email,
          fullName: email.split('@')[0].replace('.', ' '),
          role: 'student',
          faculty: 'CU UAEM Ecatepec',
          averageRating: 5.0,
        },
      };
    }
  },

  async login(email, password) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        token: 'token-uaemex-institucional',
        user: {
          id: `user-${Date.now()}`,
          email,
          fullName: email.split('@')[0].replace('.', ' '),
          role: email.includes('profesor') ? 'teacher' : 'student',
          faculty: 'CU UAEM Ecatepec',
          career: 'Ingeniería en Computación',
          averageRating: 5.0,
          totalReviews: 8,
          clabe: '012180015678901234',
          bankName: 'BBVA México',
        },
      };
    }
  },

  async forgotPassword(email) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: 'Código de recuperación enviado a tu correo institucional.',
        simulatedOtp: '654321',
      };
    }
  },

  async resetPassword(email, otp, newPassword) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      return await res.json();
    } catch {
      return {
        success: true,
        message: '¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión.',
      };
    }
  },

  // Productos conectados directo a Supabase en la nube
  async getProducts() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*&order=created_at.desc`, {
        headers: supabaseHeaders
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
      return [];
    } catch {
      return [];
    }
  },

  async createProduct(productData) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify(productData),
      });
      if (res.ok) {
        const json = await res.json();
        return { success: true, data: Array.isArray(json) ? json[0] : json };
      }
      const err = await res.json().catch(() => null);
      console.warn('Respuesta Supabase createProduct:', err);
      return null;
    } catch (err) {
      console.warn('Error al conectar con Supabase para publicar producto:', err);
      return null;
    }
  },

  async getCategories() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/categories?select=*`, {
        headers: supabaseHeaders
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
      return MOCK_CATEGORIES;
    } catch {
      return MOCK_CATEGORIES;
    }
  },

  async getFaculties() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/faculties?select=*`, {
        headers: supabaseHeaders
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) return data;
      }
      return MOCK_FACULTIES;
    } catch {
      return MOCK_FACULTIES;
    }
  },

  // Objetos Perdidos conectados directo a Supabase en la nube
  async getLostItems() {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/lost_items?select=*&order=created_at.desc`, {
        headers: supabaseHeaders
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) return data;
      }
      return [];
    } catch {
      return [];
    }
  },

  async createLostItem(reportData) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/lost_items`, {
        method: 'POST',
        headers: supabaseHeaders,
        body: JSON.stringify(reportData),
      });
      if (res.ok) {
        const json = await res.json();
        return { success: true, data: Array.isArray(json) ? json[0] : json };
      }
      return null;
    } catch (err) {
      console.warn('Error al conectar con Supabase para reportar objeto:', err);
      return null;
    }
  },

  async resolveLostItem(itemId) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/lost_items?id=eq.${itemId}`, {
        method: 'PATCH',
        headers: supabaseHeaders,
        body: JSON.stringify({ status: 'resolved' }),
      });
      return res.ok;
    } catch (err) {
      console.warn('Error marcando resuelto en Supabase:', err);
      return false;
    }
  },
};
