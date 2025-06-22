import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registration-form',
  templateUrl: './registration-form.component.html',
  styleUrls: ['./registration-form.component.css']
})
export class RegistrationFormComponent {
  registrationForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.registrationForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      guests: [1, Validators.required],
      notes: ['']
    });
  }

  register() {
    if (this.registrationForm.valid) {
      let registrations = JSON.parse(localStorage.getItem('registrations') || '[]');
      registrations.push(this.registrationForm.value);
      localStorage.setItem('registrations', JSON.stringify(registrations));
      alert('Registration Successful!');
      this.registrationForm.reset();
    }
  }
}
