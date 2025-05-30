import axios from 'axios';

// const api = axios.create({
//   baseURL: API_BASE
// });

// const api = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api'
// });

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api'
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error || error.message;
    console.error('API Error:', message);

    // Maps-specific error alert
    if (message.includes('API key')) {
      alert('Maps API error – please check your Google API key configuration.');
    }

    return Promise.reject(error);
  }
);

// api.interceptors.response.use(
//   response => response,
//   error => {
//     if (error.response?.data?.error?.includes('API key')) {
//       alert('Maps API error - check configuration');
//     }
//     return Promise.reject(error);
//   }
// );

export const estimatesApi = {
  create: (data) => api.post('/estimates/estimations', {
    serviceType: data.serviceType.toUpperCase().replace(/ /g, '_'),
    pickupLocation: data.pickupLocation.trim(),
    dropLocation: data.dropLocation.trim(),
    vehicleType: data.vehicleType,
    temperature: Number(data.temperature),
    quantity: Number(data.quantity),
    productType: data.productType,
    pickupDate: new Date(data.pickupDate).toISOString(),
    dropDate: new Date(data.dropDate).toISOString()
  }),
  getPricing: () => api.get('/admin/pricing'),
  updatePricing: (serviceType, data) => api.put(`/admin/pricing/${serviceType}`, data)
};

export const mapsApi = {
  getDistance: (pickup, drop) => api.get('/maps/distance', { params: { pickup, drop } })
};

export default api;