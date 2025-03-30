import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CityService {
  constructor(private http: HttpClient) {}

  getCities() {
    return this.http.get<any[]>('assets/cities.json');
  }
}
