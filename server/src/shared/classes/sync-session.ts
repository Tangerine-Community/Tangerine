
export type doc_id = string

export interface SyncSession {
  syncUrl: string
  doc_ids: Array<doc_id>
}