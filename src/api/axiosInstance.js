import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

const axiosInstance = axios.create({
  baseURL: API_BASE,
  withCredentials: true,      // important: allows sending/receiving cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Optional helper to set Authorization header (if you prefer Bearer tokens)
export function setAuthToken(token) {
  if (token) axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  else delete axiosInstance.defaults.headers.common['Authorization'];
}

export default axiosInstance;
