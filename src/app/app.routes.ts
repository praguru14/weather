import { Routes } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar.component';
import { WeatherDataComponent } from './components/weather-data/weather-data.component';
import { TaskListComponent } from './components/task-list/task-list.component';
import { RegistrationListComponent } from './comp/forms/reg/registration-list/registration-list.component';
import { RegistrationFormComponent } from './comp/forms/reg/registration-form/registration-form.component';

// import { SettingsComponent } from './settings/settings.component';
import { AppMyChartComponent } from './app-my-chart/app-my-chart.component';

export const appRoutes: Routes = [
  { path: '', component: WeatherDataComponent }, // Default page
  { path: 'weather', component: WeatherDataComponent },
  { path: 'registrations', component: RegistrationFormComponent },
  { path: 'tasks', component: TaskListComponent },
  {path: 'chart',component:AppMyChartComponent}
//   { path: 'settings', component: SettingsComponent },
//   { path: 'sidebar', component: SidebarComponent }, // Optional: Load sidebar separately
];
