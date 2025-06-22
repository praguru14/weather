import { Component, NgZone, ViewChild } from '@angular/core';
import { WeatherServiceService } from '../../services/weather-service.service';
import { FormsModule, NgModel } from '@angular/forms';
import { DatePipe, DecimalPipe, JsonPipe, NgFor, NgIf } from '@angular/common';
import { CitySearchComponent } from '../city-search/city-search.component';
// import { CitySearchComponent } from '../city-search/city-search.component';
// import { NgChartsModule } from 'ng2-charts';
// import * as L from 'leaflet';
import type { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
// import { BaseChartDirective } from 'ng2-charts';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
@Component({
  selector: 'app-weather-data',
  imports: [FormsModule, NgIf, NgFor, DecimalPipe,CitySearchComponent,BaseChartDirective],
  templateUrl: './weather-data.component.html',
  styleUrl: './weather-data.component.css'
})
export class WeatherDataComponent {
  city: any;
  lat: any;
  lng: any;
  cityData: any = {};
  errorMessage: string = '';
  showHistory: boolean = false;
  loading = false;
  name: any = '';
  country: any = '';
  isCelcius: boolean = true;
  map: any;
  sortOrder: string = 'asc'; 

  highestTemperature: number = 0;
  lowestTemperature: number = 0;
  averageHumidity: number = 0;
  maxWindSpeed: number = 0;
  viewMode: 'table' | 'chart' = 'table';  // Default to table view
  displayName: any;
  isLocationBased: boolean | undefined;
   @ViewChild(CitySearchComponent) citySearchComponent!: CitySearchComponent;
clearSearch() {
    if (this.citySearchComponent) {
      this.citySearchComponent.city = '';  // Clear city input
      this.citySearchComponent.filteredCityList = [];  // Clear suggestions
    }
  }
  customRange: number | null = null;

  constructor(private weatherService: WeatherServiceService, private ngZone: NgZone) {}

  ngOnInit() {}


  toggleSortOrder() {

  this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  // this.sortTemperature();
}
sortTemperature() {
  const direction = this.sortOrder === 'asc' ? 1 : -1;
  this.cityData.hourly.temperature_2m.sort((a: any, b: any) => (Number(a) - Number(b)) * direction);
}

  toggleViewMode() {
  this.viewMode = this.viewMode === 'table' ? 'chart' : 'table';
}
  toggleTemp() {
    this.isCelcius = !this.isCelcius;
  }

  convertTemp(temp: number) {
    if (this.isCelcius) {
      return temp;
    }
    return Math.round((temp * 9 / 5) + 32).toFixed(2);
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
  }

  getWeatherData(isLocationBased: boolean = false) {
    this.loading = true;
    this.errorMessage = '';
    this.cityData = {};
  
    this.weatherService.getLatLongFromCity(this.city).subscribe({
      next: (geoData) => {
        if (geoData.results && geoData.results.length > 0) {
          this.lat = geoData.results[0].latitude;
          this.lng = geoData.results[0].longitude;
          this.name = geoData.results[0].name;
          this.country = geoData.results[0].country;
          console.log(`Coordinates for ${this.city}: Latitude=${this.lat}, Longitude=${this.lng}`);
          localStorage.setItem('location', JSON.stringify(this.city));
          const locationData = JSON.parse(localStorage.getItem('location') || '{}');
          console.log("From Local Storage: " + locationData);
          this.addCityToHistory(this.city);
      

          this.weatherService.callWeatherAPI(this.lat, this.lng).subscribe({
            next: (weatherData) => {
              console.log("Weather Data:", weatherData);
              this.loading = false;
              this.cityData = weatherData;
              this.calculateWeatherStats();
               this.isLocationBased = isLocationBased;
                          // this.sortTemperature();  
                              // this.displayName=''
           
            },
            error: (err) => {
              console.error("Error fetching weather data:", err);
              this.loading = false;
            }
          });
        } else {
          console.error("City not found!");
          this.errorMessage = 'Error fetching city data. Please try again.';
          this.loading = false;
        }
      },
      error: (err) => {
        console.error("Error fetching coordinates:", err);
        this.errorMessage = 'Error fetching coordinates. Please try again later.';
        this.loading = false;
      }
    });
  }

  
  calculateWeatherStats() {
    if (this.cityData?.hourly) {
      const temperatures = this.cityData.hourly.temperature_2m;
      const humidities = this.cityData.hourly.relative_humidity_2m;
      const windSpeeds = this.cityData.hourly.wind_speed_10m;

      this.highestTemperature = Math.max(...temperatures);
      this.lowestTemperature = Math.min(...temperatures);
      this.averageHumidity = humidities.reduce((sum: any, h: any) => sum + h, 0) / humidities.length;
      this.maxWindSpeed = Math.max(...windSpeeds);
    }
  }

  getLoc() {
  if (!("geolocation" in navigator)) {
    console.error("Geolocation is not supported by this browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      this.weatherService.getCityFromLatLong(lat, lng).subscribe(
        (data) => {
          console.log("City data from current location:", data);
          console.log("City data from current location:", data.address.city);
          this.city = data.address.city;
           this.displayName = data.display_name;
                this.getWeatherData(true); 
          //     this.isLocationBased = true;
          // this.getWeatherData();
        },
        (error) => {
          console.error("Error fetching city data from current location:", error);
        }
      );
      console.log(`Latitude: ${lat}, Longitude: ${lng}`);

      // this.weatherService.callWeatherAPI(lat, lng).subscribe(
      //   (data) => {
      //     console.log("Weather data from current location:", data);
      //     localStorage.setItem('location', JSON.stringify(data));
          
      //     const locationData = JSON.parse(localStorage.getItem('location') || '{}');
      //     console.log("From Local Storage:", locationData);

      //     // Optionally update city data or UI
      //     this.cityData = data;
      //   },
      //   (error) => {
      //     console.error("Error fetching weather data from current location:", error);
      //   }
      // );
    },
    (error) => {
      console.error("Error getting user location:", error);
    }
  );
}

onCitySelected(city: string) {
  this.city = city;
  this.getWeatherData();
}

 
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours() % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = date.getHours() >= 12 ? 'PM' : 'AM';

    return `${day}-${month}-${year} ${hours}:${minutes} ${period}`;
  }

  addCityToHistory(city: string) {
    let cityHistory: string[] = JSON.parse(localStorage.getItem('cityHistory') || '[]');
    if (!cityHistory.includes(city)) {
      cityHistory.push(city);
    }

    if (cityHistory.length > 5) {
      cityHistory.shift();
    }

    localStorage.setItem('cityHistory', JSON.stringify(cityHistory));
  }

  getCityHistory(): string[] {
    return JSON.parse(localStorage.getItem('cityHistory') || '[]');
  }

  clearCityHistory() {
    localStorage.removeItem('cityHistory');
    console.log("Search history cleared.");
  }
  debounceTimer: any;
  // customRange: number | null = null;

  // applyCustomRange() {
  //   if (this.customRange && this.customRange > 0 && this.customRange <= 168) {
  //     this.selectedRange = this.customRange;
  //     this.prepareChartData();
  //   } else {
  //     alert("Please enter a value between 1 and 168 hours.");
  //   }
  // }
  applyCustomRange() {
    const val = this.customRangeInput;
  
    if (val && val > 0 && val <= 168) {
      this.selectedRange = val;
      this.prepareChartData();
      this.prepareChartData();
    } else {
      alert("Please enter a value between 1 and 168 hours.");
    }
  }
  reset(){
    this.customRangeInput = null;
    this.selectedRange = 72; // Reset to default range
    this.prepareChartData();
    this.prepareChartData();
  }
//   closeChartModal() {
//   this.showChartModal = false;
//   this.reset();  // 👈 Trigger reset on close
// }

  customRangeInput: number | null = null;

onCustomRangeChange(value: number) {
  this.customRangeInput = value;
}

  
  
  

  showChartModal = false;

lineChartData: ChartConfiguration<'line'>['data'] = {
  labels: [],
  datasets: [
    {
      label: 'Temperature (°C)',
      data: [],
      borderColor: 'rgba(75,192,192,1)',
      backgroundColor: 'rgba(75,192,192,0.2)',
      tension: 0.4
    }
  ]
};

lineChartOptions: ChartConfiguration<'line'>['options'] = {
  responsive: true,
  plugins: {
    legend: {
      display: true
    }
  }
};

openChartModal() {
  this.prepareChartData();
  this.showChartModal = true;
}

closeChartModal() {
  this.showChartModal = false;
  this.reset();  // Reset the chart data when closing the modal
}

prepareChartData() {
  if (this.chart) {
    this.chart.update();
  }
  
  const range = this.selectedRange; 

  const labels = this.cityData.hourly.time
    .slice(0, range)
    .map((time: string) => this.formatDate(time));

  const temps = this.cityData.hourly.temperature_2m
    .slice(0, range)
    .map((t: number) => this.convertTemp(t));

  this.lineChartData.labels = labels;
  this.lineChartData.datasets[0].data = temps;
}
@ViewChild(BaseChartDirective) chart?: BaseChartDirective;
selectedRange: number = 72; 

setRange(hours: number) {
  this.selectedRange = hours;
  this.prepareChartData();
}

}
