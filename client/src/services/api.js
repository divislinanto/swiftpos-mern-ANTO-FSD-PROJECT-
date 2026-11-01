const API_BASE = '/api';

// Helper for HTTP requests
const request = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const res = await fetch(url, config);
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Request failed with status ${res.status}`);
    }
    return data;
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    throw error;
  }
};

export const api = {
  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/products${query ? `?${query}` : ''}`);
  },

  getProductByBarcode: (barcode) => {
    return request(`/products/barcode/${encodeURIComponent(barcode)}`);
  },

  getCategories: () => {
    return request('/products/categories');
  },

  addProduct: (productData) => {
    return request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  },

  updateProduct: (id, productData) => {
    return request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  },

  updateStock: (id, stockPayload) => {
    return request(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify(stockPayload),
    });
  },

  deleteProduct: (id) => {
    return request(`/products/${id}`, {
      method: 'DELETE',
    });
  },

  // Orders
  createOrder: (orderData) => {
    return request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getOrders: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/orders${query ? `?${query}` : ''}`);
  },

  getOrderById: (id) => {
    return request(`/orders/${id}`);
  },

  refundOrder: (id) => {
    return request(`/orders/${id}/refund`, {
      method: 'POST',
    });
  },

  // Analytics & Health
  getAnalytics: () => {
    return request('/analytics/dashboard');
  },

  getHealth: () => {
    return request('/health');
  },
};
