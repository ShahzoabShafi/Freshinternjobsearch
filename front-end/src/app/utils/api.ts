//Step 3 for auth: Base Api client (sets base url and defaults and step 5)
import axios from 'axios'
import { getAccessToken } from '../authentication/tokenStorage'

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
})

// request interceptor is a function axios runs on every request before it goes out.
// its job is to add the add token to the request header if it exisits
apiClient.interceptors.request.use((config) => {
    const token = getAccessToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default apiClient;