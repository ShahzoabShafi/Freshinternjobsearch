//Step 3 for auth: Base Api client (sets base url and defaults and step 5)
import axios from "axios";
import { getAccessToken } from "../authentication/tokenStorage";
import { Filters } from "../types/filters";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  }
});

// request interceptor is a function axios runs on every request before it goes out.
// its job is to add the add token to the request header if it exisits
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// the native JS way to set up this file
// const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
// export async function apiFetch(endpoint: string) {
//   const apiPath = `${BASE_URL}${endpoint}`;
//   const response = await fetch(apiPath);
//   if (!response.ok) {
//     throw new Error(`API request failed with status ${response.status}`);
//   }
//   return await response.json();
// }


// ------------------APIS-----------------------
export async function fetchInternships(filters) {
    return apiClient.get("/api/jobs", { params: filters });
}


export default apiClient;
