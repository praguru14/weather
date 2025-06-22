import { Component } from '@angular/core';

@Component({
  selector: 'app-registration-list',
  imports: [],
  templateUrl: './registration-list.component.html',
  styleUrl: './registration-list.component.css'
})
export class RegistrationListComponent {
registrations = JSON.parse(localStorage.getItem('registrations') || '[]');

  deleteRegistration(index: number) {
    this.registrations.splice(index, 1);
    localStorage.setItem('registrations', JSON.stringify(this.registrations));
  }
}
