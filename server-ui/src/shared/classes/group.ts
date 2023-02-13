
type doc_id = string

export interface Group {
  _id: doc_id
  label: string
  created: string
  // A general config object for modules to attach whatever settings they need.
  config:any
  roles: any []
}