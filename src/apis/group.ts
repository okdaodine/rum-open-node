import request from 'request';
import { API_BASE_URL } from './common';
import { IGroup } from './types';

interface ICreatePayload {
  groupName: string
  appKey: string
  encryptionType: string
}

export default {
  async create(payload: ICreatePayload) {
    const res: IGroup = await request(`${API_BASE_URL}/groups`, {
      method: 'POST',
      body: payload
    });
    return res;
  },

  async get(groupId: string) {
    const item: IGroup = await request(`${API_BASE_URL}/groups/${groupId}`);
    return item;
  },

  async list() {
    const items: IGroup[] = await request(`${API_BASE_URL}/groups`);
    return items;
  },

  async remove(groupId: string) {
    await request(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'delete'
    });
  },

  async getSeed(groupId: string) {
    await request(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'delete'
    });
  },
}