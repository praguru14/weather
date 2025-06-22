import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private tasks: string[] = [];

   constructor() {
    this.loadTasks(); 
  }
  getTasks() {
    return this.tasks;
  }

  addTask(task: string) {
    this.tasks.push(task);
    this.saveTasks();
  }

  removeTask(index: number) {
    this.tasks.splice(index, 1);
    this.saveTasks()
  }

  private saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(this.tasks));
  }

  private loadTasks() {
    this.tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  }
 updateTasks(updatedTasks: string[]) {
    this.tasks = updatedTasks;
      this.saveTasks()
    // this.tasks = JSON.parse(localStorage.getItem('tasks') || '[]');
  }
}
