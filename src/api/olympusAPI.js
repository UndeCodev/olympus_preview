import axios from 'axios';

const olympusAPI = axios.create({
  baseURL: 'http://localhost:3000/auth',
});

export default olympusAPI;
