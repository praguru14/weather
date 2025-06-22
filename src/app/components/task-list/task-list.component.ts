import { Component } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { TaskService } from '../../services/task.service';
import {DragDropModule} from '@angular/cdk/drag-drop';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-list',
  imports: [NgFor,NgIf,FormsModule,CdkDropList, CdkDrag,DragDropModule],
  templateUrl: './task-list.component.html',
  styleUrl: './task-list.component.css'
})
export class TaskListComponent {

  tasks:string[]=[];
  newTask:string='';
  editedTask:string='';
  editedTaskIndex:number|null=null;
  constructor(private taskService:TaskService) {
    this.tasks = this.taskService.getTasks();
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks && storedTasks.length > 0) {

      this.tasks = JSON.parse(storedTasks);
    } else {
      this.tasks = ['Buy groceries', 'Complete Angular project', 'Call Mom']; 
      this.saveTasks();
    }
   }
   private saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(this.tasks));
}

addTask(taskInput: HTMLInputElement) {
  if (taskInput.value.trim()) {
    this.taskService.addTask(taskInput.value);
    this.tasks = [...this.taskService.getTasks()];
    taskInput.value = ''; 
    // this.tasks = this.taskService.getTasks(); // Refresh task list
  }
}

editTask(index: number, newTask: string) {
  this.editedTask = newTask;
  this.editedTaskIndex = index;

}

saveTask(index: number) {
if(this.editedTask){

  this.tasks[index]= this.editedTask;
  this.taskService.updateTasks(this.tasks);
 
}
this.editedTaskIndex=null;
}
removeTask(index: number) {
  this.taskService.removeTask(index);
   this.tasks = [...this.taskService.getTasks()];
   
  // this.tasks = this.taskService.getTasks(); // Refresh task list

}

 drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.tasks, event.previousIndex, event.currentIndex);
    // this.saveTasks();
  }
}
