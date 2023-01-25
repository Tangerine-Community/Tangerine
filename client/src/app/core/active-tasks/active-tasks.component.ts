import {Component, OnInit} from '@angular/core';
import {ActiveTask} from "./ActiveTask.class";
import PouchDB from 'pouchdb';
import { interval, Subscription } from 'rxjs';


@Component({
  selector: 'app-active-tasks',
  templateUrl: './active-tasks.component.html',
  styleUrls: ['./active-tasks.component.css']
})
export class ActiveTasksComponent implements OnInit {
  activeTasks:Array<ActiveTask> = []
  isOpen = false;
  dataSource = []
  displayedColumns: string[] = ['created_at', 'updated_at', 'name', 'completed_items', 'total_items'];
  subscription: Subscription;

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

    const source = interval(3000);
    this.subscription = source.subscribe(val => this.getActiveTasks());
  }
  showActiveTasks() {
    this.isOpen = !this.isOpen
    if (this.isOpen) {
      this.getActiveTasks()
    }
  }

  private getActiveTasks() {
    let tasks = []
    tasks = PouchDB.activeTasks.list()
    // const test =   {
    //   "id": "c129574d-c313-4a44-baa4-5be02960160a",
    //   "name": "replication from shared-user-database",
    //   "created_at": "2023-01-17T23:37:25.792Z",
    //   "total_items": 59824,
    //   "completed_items": 3200,
    //   "updated_at": "2023-01-17T23:43:10.522Z"
    // }
    // tasks.push(test)
    this.activeTasks = tasks.map(task => {
      const activeTask = new ActiveTask(task)
      return activeTask
    })
    this.dataSource = this.activeTasks
    // console.log("this.activeTasks: " + this.activeTasks.length)
  }

  onCloseClick() {
    this.isOpen = false
  }
}
