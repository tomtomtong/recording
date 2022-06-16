import Axios from 'axios';

export const axiosInstance = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL
});

axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;

    return config
});