// Detectar automáticamente si se accede desde localhost o desde la IP de la red Wi-Fi
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_BASE_URL = `http://${hostname}:5001/api`;

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
          faculty: 'Facultad de Ingeniería',
          averageRating: 4.9,
          totalReviews: 12,
        },
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
