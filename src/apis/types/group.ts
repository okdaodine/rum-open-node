export interface IGroup {
  userId: string
  lastUpdated: number
  seed: string
  raw: {
    group_id: string
    group_name: string
    owner_pubkey: string
    user_pubkey: string
    user_eth_addr: string
    consensus_type: string
    encryption_type: string
    cipher_key: string
    app_key: string
    currt_epoch: number
    currt_top_block: number
    last_updated: number,
    rex_syncer_status: string
    rex_Syncer_result: any
  }
}