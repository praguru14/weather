import { Component } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-form-builder',
  imports: [FormsModule,ReactiveFormsModule],
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.css'
})
export class FormBuilderComponent {
 name = new FormControl('');

 profileForm= new FormGroup({
    firstName: new FormControl(''),
    lastName: new FormControl('')
  });
 updateName() {
    this.name.setValue('Nancy');
  }
}
