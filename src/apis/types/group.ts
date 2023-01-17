import { IGroup as IRawGroup } from 'quorum-light-node-sdk';

export interface IGroup {
  userId: string
  lastUpdated: number
  seed: string
  raw: IRawGroup
}