import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class WeatherServiceService {
  private weatherUrl = 'https://api.open-meteo.com/v1/forecast?';
  private geoUrl = 'https://geocoding-api.open-meteo.com/v1/search?name='; 
  private currentLocationUrl = 'https://nominatim.openstreetmap.org/reverse?'

  constructor(private http: HttpClient) {}

  callWeatherAPI(latitude: number, longitude: number): Observable<any> {
    console.log(`${this.weatherUrl}latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,temperature_80m`);
    return this.http.get(`${this.weatherUrl}latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,temperature_80m`);
  }

  getLatLongFromCity(city: string): Observable<any> {
    return this.http.get(`${this.geoUrl}${encodeURIComponent(city)}&count=1`);
  }

  getCityFromLatLong(lat: number, long: number): Observable<any> {
    //lat=28.55422942390476&lon=77.17369465348366&format=json
  return this.http.get(`${this.currentLocationUrl}lat=${lat}&lon=${long}&format=json`);
  }
}
