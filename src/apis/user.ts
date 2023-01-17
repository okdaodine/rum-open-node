import request from 'request';
import { API_BASE_URL } from './common';
import { IUser } from './types';

export default {
  async get() {
    const item: IUser = await request(`${API_BASE_URL}/users/me`);
    return item;
  }
}

