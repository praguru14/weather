import { Component, EventEmitter, Output } from '@angular/core';
import { NgIf } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatRadioModule } from '@angular/material/radio';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sidebar',
  standalone: true, // ✅ Required for Angular 17 Standalone Component
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  imports: [NgIf, MatIconModule, MatButtonModule, MatSidenavModule, MatRadioModule, FormsModule] // ✅ Correct imports
})
export class SidebarComponent {
  tempUnit = 'C'; // Default unit

  @Output() themeChanged = new EventEmitter<string>();
  @Output() tempUnitChanged = new EventEmitter<string>();

  setTempUnit() {
    this.tempUnitChanged.emit(this.tempUnit); // Emit selected unit
  }

  changeTheme(theme: string) {
    this.themeChanged.emit(theme); // Emit selected theme
    document.body.className = theme; // Apply theme
  }
}
