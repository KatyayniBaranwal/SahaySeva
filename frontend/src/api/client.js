import axios from 'axios';

const client = axios.create({ baseURL: '/api' });

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('sahayseva_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message || 'Something went wrong. Please try again.';
    const error = new Error(message);
    error.status = err.response?.status;
    return Promise.reject(error);
  }
);

export default client;
