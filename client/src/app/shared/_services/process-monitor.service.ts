import { Subject } from 'rxjs';
import { v4 as UUID } from 'uuid';
import { Injectable } from '@angular/core';

interface Process {
  id:string
  name:string
  description:string
}

@Injectable({
  providedIn: 'root'
})
class ProcessMonitorService {

  // When number of processes go from 0 to 1, this Subject will emit true.
  busy = new Subject()
  // When number of processes go to 0, this Subject will emit true.
  done = new Subject()
  // A list of the active processes.
  processes:Array<Process> = []

  constructor() {
  }

  start(name, description):Process {
    const process = <Process>{
      id: UUID(),
      name,
      description
    }
    let hasNoProcesses = this.processes.length === 0
      ? true
      : false
    this.processes.push(process)
    if (hasNoProcesses) {
      this.busy.next(true)
    }
    return process
  }

  stop(pid:string) {
    this.processes = this.processes.filter(process => process.id === pid)
    if (this.processes.length === 0) {
      this.done.next(true)
    }
  }

}

export { ProcessMonitorService };