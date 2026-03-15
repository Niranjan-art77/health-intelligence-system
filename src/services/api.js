import axios from "axios";

const API = axios.create({
  baseURL: "https://hospital-intelligence-system-production.up.railway.app/api"
});

API.interceptors.request.use((config) => {
  const savedUser = localStorage.getItem("nova_user");

  if (savedUser) {
    const { token } = JSON.parse(savedUser);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export default API;