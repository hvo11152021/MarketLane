import axios from "axios";

const BASE_URL = "http://localhost:8080/api";

const API = axios.create({
  baseURL: BASE_URL,
});

/* ---------- Request Interceptor ---------- */
/* Attach auth token to every request if available */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/* ---------- Response Interceptor ---------- */
/* Handle expired/invalid token globally */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("role");

      window.dispatchEvent(new Event("authChanged"));
    }

    return Promise.reject(error);
  }
);

export default API;