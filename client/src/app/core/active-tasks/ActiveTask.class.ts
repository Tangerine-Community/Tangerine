class ActiveTask {
  id: string
  name: string
  created_at: string
  total_items: string
  completed_items: string
  updated_at: string

  constructor(data?:any) {
    Object.assign(this, data)
  }
}

export {ActiveTask}