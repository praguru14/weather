import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherDataComponent } from './components/weather-data/weather-data.component';
import { CitySearchComponent } from './components/city-search/city-search.component';
// import { FormBuilderComponent } from './components/form-builder/form-builder.component';
// import { NgxChartjsModule } from 'ngx-chartjs';

@Component({
  selector: 'app-root',
  imports: [WeatherDataComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'weather';

  toggleDarkMode() {
  const body = document.body;
  body.classList.toggle('dark-mode');
  
  // Save the theme preference to local storage
  const isDarkMode = body.classList.contains('dark-mode');
  localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
}

ngOnInit() {
  // Load the theme preference from local storage
  const isDarkMode = JSON.parse(localStorage.getItem('darkMode') || 'false');
  if (isDarkMode) {
    document.body.classList.add('dark-mode');
  }
}

}
