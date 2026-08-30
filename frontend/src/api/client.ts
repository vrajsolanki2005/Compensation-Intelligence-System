import axios from "axios";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
  // Fail at startup instead of silently requesting localhost:5173/api/...
  throw new Error(
    "VITE_API_URL is not set. Add it to .env (e.g. VITE_API_URL=http://localhost:5000/api) and restart Vite.",
  );
}

export const api = axios.create({
  baseURL,
  timeout: 10000,
});