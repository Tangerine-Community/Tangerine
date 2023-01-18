import {Component, OnInit} from '@angular/core';
import {ActiveTask} from "./ActiveTask.class";
import PouchDB from 'pouchdb';

@Component({
  selector: 'app-active-tasks',
  templateUrl: './active-tasks.component.html',
  styleUrls: ['./active-tasks.component.css']
})
export class ActiveTasksComponent implements OnInit {
  activeTasks:Array<ActiveTask> = []
  isOpen = false;

  ngOnInit(): void {
    // const tasks = []
    // const test =   {
    //   "id": "c129574d-c313-4a44-baa4-5be02960160a",
    //   "name": "replication from shared-user-database",
    //   "created_at": "2023-01-17T23:37:25.792Z",
    //   "total_items": 59824,
    //   "completed_items": 3200,
    //   "updated_at": "2023-01-17T23:43:10.522Z"
    // }
    // tasks.push(test)
    // this.activeTasks = tasks.map(task => {
    //   const activeTask = new ActiveTask(task)
    //   return activeTask
    // })
  }
  showActiveTasks() {
    this.isOpen = !this.isOpen
    if (this.isOpen) {
      let tasks = PouchDB.activeTasks.list()
      this.activeTasks = tasks.map(task => {
        const activeTask = new ActiveTask(task)
        return activeTask
      })
    }
    
  }
}
