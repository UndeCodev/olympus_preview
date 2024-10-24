import { OLYMPUS_API_URL } from '@/utils/config';
import axios from 'axios';

const olympusAPI = axios.create({
  baseURL: OLYMPUS_API_URL,
});

olympusAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default olympusAPI;
