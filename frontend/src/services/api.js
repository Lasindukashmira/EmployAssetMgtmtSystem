import axios from 'axios';

// The backend URL is retrieved from Vite environment variables (VITE_API_BASE_URL)
// Or falls back to relative '/api' which works with our Nginx reverse proxy architecture.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000, // Timeout after 8 seconds
});

export default api;
