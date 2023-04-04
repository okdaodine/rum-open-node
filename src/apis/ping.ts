import request from 'request';
import { API_BASE_URL } from './common';

export default {
  async ping() {
    const res: boolean = await request(`${API_BASE_URL}/ping`);
    return res;
  }
}

