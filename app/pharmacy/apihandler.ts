import axios from "axios";
import { getAuth } from "firebase/auth";

const API_BASE = "http://localhost:5000/api"; // adjust for your case

const api = axios.create({
  baseURL: API_BASE,
});

// 🔑 Interceptor to add token automatically
api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const idToken = await user.getIdToken();
    config.headers.Authorization = `Bearer ${idToken}`;
  }

  return config;
});

export default api;
