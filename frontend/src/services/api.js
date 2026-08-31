const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    // Si estamos en Vercel o en producción, conectamos al backend de Render
    if (host.includes('vercel.app')) {
      return 'https://api-marketplace-uaemex.onrender.com/api';
    }
    return `http://${host}:5001/api`;
  }
  return 'http://localhost:5001/api';
};

const API_BASE_URL = getApiBaseUrl();

/**
 * Cliente HTTP unificado con soporte para Backend en Vivo y Fallback inteligente a datos locales
 */
export const api = {
  // Autenticación
  async register(data) {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return await res.json();
    } catch {
      // Simulación en frontend si el backend no está corriendo
      return {
        success: true,
        message: 'Código de verificación OTP generado (Modo Demostración).',
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
        token: 'mock-jwt-token-uaemex',
        user: {
          id: 'user-mock-1',
          email,
          fullName: 'Estudiante Universitario UAEMex',
          role: 'student',
          faculty: 'Facultad de Ingeniería',
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
        token: 'mock-jwt-token-uaemex',
        user: {
          id: 'user-mock-1',
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

  // Productos
  async getProducts(params = {}) {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await fetch(`${API_BASE_URL}/products?${query}`);
      const json = await res.json();
      if (json.success && json.data.length > 0) return json.data;
      return MOCK_PRODUCTS;
    } catch {
      return MOCK_PRODUCTS;
    }
  },

  async getCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      const json = await res.json();
      if (json.success && json.data.length > 0) return json.data;
      return MOCK_CATEGORIES;
    } catch {
      return MOCK_CATEGORIES;
    }
  },

  async getFaculties() {
    try {
      const res = await fetch(`${API_BASE_URL}/faculties`);
      const json = await res.json();
      if (json.success && json.data.length > 0) return json.data;
      return MOCK_FACULTIES;
    } catch {
      return MOCK_FACULTIES;
    }
  },

  async getLostItems() {
    try {
      const res = await fetch(`${API_BASE_URL}/lost-items`);
      const json = await res.json();
      if (json.success && json.data.length > 0) return json.data;
      return MOCK_LOST_ITEMS;
    } catch {
      return MOCK_LOST_ITEMS;
    }
  }
};
