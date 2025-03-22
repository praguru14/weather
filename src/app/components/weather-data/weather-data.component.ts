import { Component } from '@angular/core';
import { WeatherServiceService } from '../../services/weather-service.service';
import { FormsModule, NgModel } from '@angular/forms';
import { DatePipe, DecimalPipe, JsonPipe, NgFor, NgIf } from '@angular/common';

@Component({
  selector: 'app-weather-data',
  imports: [FormsModule,JsonPipe,NgIf,NgFor,DatePipe,DecimalPipe],
  templateUrl: './weather-data.component.html',
  styleUrl: './weather-data.component.css'
})
export class WeatherDataComponent {

  city:any;
  lat:any;
  lng:any;
cityData: any = {}; 
// dataNotFound:boolean = false;
errorMessage: string = '';
showHistory:boolean = false;
loading = false;


  constructor(private weatherService:WeatherServiceService){}

  ngOnInit(){

  }

  toggleHistory(){
    this.showHistory = !this.showHistory;
  }

  getWeatherData(){
    this.loading = true;
     this.errorMessage = '';  
  this.cityData = {}; 
    this.weatherService.getLatLongFromCity(this.city).subscribe({
      next: (geoData) => {
        if (geoData.results && geoData.results.length > 0) {
          this.lat = geoData.results[0].latitude;
          this.lng = geoData.results[0].longitude;
          console.log(`Coordinates for ${this.city}: Latitude=${this.lat}, Longitude=${this.lng}`);
            localStorage.setItem('location',JSON.stringify(this.city));
      const locationData = JSON.parse(localStorage.getItem('location') || '{}');
console.log("From Local Storage"+locationData);
  this.addCityToHistory(this.city);
         
          this.weatherService.callWeatherAPI(this.lat, this.lng).subscribe({
            next: (weatherData) => {
              console.log("Weather Data:", weatherData);
              this.loading = false;
              this.cityData = weatherData;
               this.calculateWeatherStats();
              // this.errorMessage = 'Error fetching weather data. Please try again.';
            },
            error: (err) => {
              console.error("Error fetching weather data:", err);
               this.loading = false;
            }
          });
        } else {
          console.error("City not found!");
          this.errorMessage = 'Error fetching City data. Please try again.';
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



  getLoc(){
    if ("geolocation" in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
     this.weatherService.callWeatherAPI(lat,lng).subscribe((data)=>{
      // console.log(data);
      localStorage.setItem('location',JSON.stringify(data));
      const locationData = JSON.parse(localStorage.getItem('location') || '{}');
console.log("From Local Storage"+locationData);

      // this.cityData = data;
    })
      console.log(`Latitude: ${lat}, longitude: ${lng}`);
    },
    (error) => {
      console.error("Error getting user location:", error);
    }
  );
} else {
  console.error("Geolocation is not supported by this browser.");
}
  }

  highestTemperature: number = 0;
lowestTemperature: number = 0;
averageHumidity: number = 0;
maxWindSpeed: number = 0;

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
  let cityHistory:string[]= JSON.parse(localStorage.getItem('cityHistory') || '[]');
  if(!cityHistory.includes(city)){
    cityHistory.push(city);   
  }

  if(cityHistory.length > 5){
    cityHistory.shift();
  }

  localStorage.setItem('cityHistory',JSON.stringify(cityHistory));
}

getCityHistory(): string[] {
  return JSON.parse(localStorage.getItem('cityHistory') || '[]');
}
clearCityHistory() {
  localStorage.removeItem('cityHistory');
  console.log("Search history cleared.");
}
}



