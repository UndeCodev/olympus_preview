import { OLYMPUS_API_URL } from '@/utils/config';
import axios from 'axios';

const olympusAPI = axios.create({
  baseURL: OLYMPUS_API_URL,
});

export default olympusAPI;
