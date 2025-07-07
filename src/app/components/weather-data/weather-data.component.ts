import { Component, NgZone, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe, NgFor, NgIf, SlicePipe } from '@angular/common';
import { WeatherServiceService } from '../../services/weather-service.service';
import { CitySearchComponent } from '../city-search/city-search.component';
import { BaseChartDirective } from 'ng2-charts';
import type { ChartConfiguration } from 'chart.js';
import {
  Chart,
  registerables
} from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { MatSliderModule } from '@angular/material/slider';
import * as L from 'leaflet';
import { MapService } from '../../services/map.service';

let map: L.Map | undefined;
Chart.register(...registerables, annotationPlugin);
@Component({
  selector: 'app-weather-data',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NgIf,
    NgFor,
    DecimalPipe,
    CitySearchComponent,
    BaseChartDirective,
    SlicePipe,
    MatSliderModule,
  ],
  templateUrl: './weather-data.component.html',
  styleUrl: './weather-data.component.css',
})
export class WeatherDataComponent {
  @ViewChild(CitySearchComponent) citySearchComponent!: CitySearchComponent;
  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  city: string = '';
  lat: number = 0;
  lng: number = 0;
  name: string = '';
  country: string = '';
  displayName: string = '';

  cityData: any = {};
  futureTime: any;
  aqiData: any = {};
  startIndex: any;
  errorMessage: string = '';
  loading = false;
  isCelcius = true;
  showHistory = false;
  showWeatherData = false;
  isLocationBased: boolean | undefined;
  maxDateTime: any;
  maxAqiValue: any;
  highestTemperature = 0;
  lowestTemperature = 0;
  averageHumidity = 0;
  maxWindSpeed = 0;
  sortOrder: 'asc' | 'desc' = 'asc';

  viewMode: 'table' | 'chart' = 'table';
  showChartModal = false;
  showWeatherDataModal = false;
  selectedRange = 72;
  customRangeInput: number | null = null;
  dailySummaries:
    | {
        date: string;
        weekday: string;
        maxTemp: number;
        minTemp: number;
        avgHumidity: number;
        maxWind: number;
      }[]
    | undefined;

  constructor(
    private mapService: MapService,
    private weatherService: WeatherServiceService,
    private ngZone: NgZone
  ) {}

  initializeMap(lat: number, lng: number, temp: string, humidity: string) {
    this.mapService.initMap(
      this.lat,
      this.lng,
      'map',
      (clickedLat, clickedLng) => {
        this.lat = clickedLat;
        this.lng = clickedLng;
        this.getWeatherByLatLong(clickedLat, clickedLng);
      }
    );
  }
  showWeatherModal = false;

  openModal() {
    this.showWeatherModal = true;
  }

  closeModal() {
    this.showWeatherModal = false;
  }

  // initializeMap(
  //   lat: number,
  //   lng: number,
  //   temp?: string | number,
  //   humidity?: string | number
  // ) {
  //   if (!lat || !lng) return;
  //   if (this.map) this.map.remove();

  //   this.map = L.map('map').setView([lat, lng], 10);
  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //     attribution: '&copy; OpenStreetMap contributors',
  //   }).addTo(this.map);

  //   if (temp && humidity) {
  //     L.marker([lat, lng])
  //       .addTo(this.map)
  //       .bindPopup(
  //         `<b>${this.city}</b><br>Temp: ${temp}°C<br>Humidity: ${humidity}%`
  //       )
  //       .openPopup();
  //   }
  // }
  // initializeMap(lat: number, lng: number, temp: string, humidity: string) {
  //   if (map) {
  //     map.remove(); // Remove old map instance
  //   }

  //   map = L.map('map').setView([lat, lng], 10);

  //   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  //     attribution: '&copy; OpenStreetMap contributors',
  //   }).addTo(map);

  //   // ✅ Use custom icon
  //   const myCustomIcon = L.icon({
  //     iconUrl: 'assets/pin.png', // Make sure the path is correct
  //     iconSize: [30, 40],
  //     iconAnchor: [15, 40], // Optional: anchors the icon point to the exact lat/lng
  //     popupAnchor: [0, -40], // Optional: offset the popup
  //   });

  //   L.marker([lat, lng], { icon: myCustomIcon })
  //     .addTo(map)
  //     .bindPopup(
  //       `<b>${this.city}</b><br>Temp: ${temp}°C<br>Humidity: ${humidity}%`
  //     )
  //     .openPopup();
  // }

  lineChartData: ChartConfiguration<'line'>['data'] = {
    labels: [],
    datasets: [
      {
        label: 'Temperature (°C)',
        data: [],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        yAxisID: 'y',
      },
      {
        label: 'Humidity (%)',
        data: [],
        borderColor: '#66BB6A',
        backgroundColor: 'rgba(102,187,106,0.3)',
        yAxisID: 'y1',
      },
      {
        label: 'Wind Speed (m/s)',
        data: [],
        borderColor: '#FFA726',
        backgroundColor: 'rgba(255,167,38,0.3)',
        yAxisID: 'y',
      },
    ],
  };

  lineChartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      tooltip: {
        enabled: true,
      },
      annotation: {
        annotations: {
          highTempLine: {
            type: 'line',
            yMin: 30,
            yMax: 30,
            borderColor: 'red',
            borderWidth: 2,
            label: {
              content: 'Heat Alert',
              display: true,
              position: 'start',
            },
          },
        },
      },
    },
    scales: {
      y: {
        type: 'linear',
        position: 'left',
        title: {
          display: true,
          text: 'Temperature (°C)',
          color: 'rgba(75,192,192,1)',
        },
      },
      y1: {
        type: 'linear',
        position: 'right',
        title: { display: true, text: 'Humidity (%)' },
        grid: { drawOnChartArea: false },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeInBounce',
    },
  };

  // constructor(

  // ) {}

  hoursToShow: number = 24;

  ngOnInit() {
    this.getLoc();
    // this.mapService.initMap(this.lat, this.lng);
    // setTimeout(() => {
    //   this.mapService.showUserLocation(this.lat, this.lng);
    // }, 100);
  }

  toggleTemp(): void {
    this.isCelcius = !this.isCelcius;
  }
  formatDateSafe(time: unknown): string {
    if (typeof time === 'string') {
      return this.formatDate(time);
    }
    return 'Invalid date';
  }
  onSliderInput(value: number) {
    this.hoursToShow = value;
    console.log('Slider value:', value);
  }
  handleSliderInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.valueAsNumber;
    this.hoursToShow = value;
    this.prepareChartData();
    console.log('Slider value:', value);
  }

  convertTemp(temp: number): number | string {
    return this.isCelcius ? temp : Math.round((temp * 9) / 5 + 32).toFixed(2);
  }

  toggleHistory(): void {
    this.showHistory = !this.showHistory;
  }
  toggleWeatherData(): void {
    this.showWeatherData = !this.showWeatherData;
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);

    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    const dayName = days[date.getDay()];

    const hours = date.getHours() % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const period = date.getHours() >= 12 ? 'PM' : 'AM';

    const currentDateAndTime = new Date();
    //  console.log(currentDateAndTime.getHours() +" current time");

    return `${dayName} ${hours}:${minutes} ${period}`;
    // const date = new Date(dateString);
    // const day = String(date.getDate()).padStart(2, '0');
    // const month = String(date.getMonth() + 1).padStart(2, '0');
    // const year = date.getFullYear();
    // const hours = date.getHours() % 12 || 12;
    // const minutes = String(date.getMinutes()).padStart(2, '0');
    // const period = date.getHours() >= 12 ? 'PM' : 'AM';
    // return `${day}-${month}-${year} ${hours}:${minutes} ${period}`;
  }

  clearSearch(): void {
    if (this.citySearchComponent) {
      this.citySearchComponent.city = '';
      this.citySearchComponent.filteredCityList = [];
    }
  }

  getCityHistory(): string[] {
    return JSON.parse(localStorage.getItem('cityHistory') || '[]');
  }

  clearCityHistory(): void {
    localStorage.removeItem('cityHistory');
  }

  addCityToHistory(city: string): void {
    const cityHistory: string[] = this.getCityHistory();
    if (!cityHistory.includes(city)) cityHistory.push(city);
    if (cityHistory.length > 5) cityHistory.shift();
    localStorage.setItem('cityHistory', JSON.stringify(cityHistory));
  }

  getWeatherData(isLocationBased: boolean = false): void {
    this.loading = true;
    this.errorMessage = '';
    this.cityData = {};
    this.hoursToShow = 24;

    this.weatherService.getLatLongFromCity(this.city).subscribe({
      next: (geoData) => {
        if (geoData.results?.length) {
          const result = geoData.results[0];
          this.lat = result.latitude;
          this.lng = result.longitude;
          this.name = result.name;
          this.country = result.country;
          this.isLocationBased = isLocationBased;

          localStorage.setItem('location', JSON.stringify(this.city));
          this.addCityToHistory(this.city);

          this.weatherService.callAqiService(this.lat, this.lng).subscribe({
            next: (weatherData) => {
              this.aqiData = weatherData;
              const pm25Array = this.aqiData.hourly.pm2_5;
              const timeArray = this.aqiData.hourly.time;

              // Find max value and its index
              const maxPm25 = Math.max(...pm25Array);
              const maxIndex = pm25Array.indexOf(maxPm25);

              // Get corresponding datetime
              this.maxDateTime = timeArray[maxIndex];
              this.maxAqiValue = maxPm25;

              this.calculateWeatherStats();
              this.loading = false;
            },
            error: (err) => {
              this.errorMessage = 'Error fetching Aqi data.';
              this.loading = false;
            },
          });

          this.weatherService.callWeatherAPI(this.lat, this.lng).subscribe({
            next: (weatherData) => {
              this.cityData = weatherData;
              const now = new Date();
              this.startIndex = this.cityData.hourly.time.findIndex(
                (t: string) => new Date(t) >= now
              );
              this.calculateWeatherStats();
              this.loading = false;
              this.prepareChartData();
              this.getDailySummary();
              setTimeout(() => {
                this.initializeMap(
                  this.lat,
                  this.lng,
                  this.cityData.hourly.temperature_2m[0],
                  this.cityData.hourly.relative_humidity_2m[0]
                );
              });
            },
            error: (err) => {
              this.errorMessage = 'Error fetching weather data.';
              this.loading = false;
            },
          });
        } else {
          this.errorMessage = 'City not found.';
          this.loading = false;
        }
      },
      error: () => {
        this.errorMessage = 'Error fetching coordinates.';
        this.loading = false;
      },
    });
  }

  getDailyTemperature() {
    const result: {
      formattedDate: string;
      maxTemp: number;
      minTemp: number;
    }[] = [];
    if (!this.cityData?.hourly?.time || !this.cityData?.hourly?.temperature_2m)
      return result;

    const time = this.cityData.hourly.time;
    const temps = this.cityData.hourly.temperature_2m;

    time.forEach((dateStr: string, index: number) => {
      const date = new Date(dateStr);
      const options: Intl.DateTimeFormatOptions = { weekday: 'short' };
      const day = date.toLocaleDateString('en-IN', options); // e.g. "Sat"

      const formattedDate = `${day}, ${date
        .getDate()
        .toString()
        .padStart(2, '0')}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${date.getFullYear()}`;

      // Example output: "Sat, 05-07-2025"

      const temp = temps[index];

      const existing = result.find((r) => r.formattedDate === formattedDate);
      if (existing) {
        existing.maxTemp = Math.max(existing.maxTemp, temp);
        existing.minTemp = Math.min(existing.minTemp, temp);
      } else {
        result.push({ formattedDate, maxTemp: temp, minTemp: temp });
      }
    });
    return result;
  }

  calculateWeatherStats(): void {
    if (this.cityData?.hourly) {
      const temps = this.cityData.hourly.temperature_2m;
      const humidity = this.cityData.hourly.relative_humidity_2m;
      const wind = this.cityData.hourly.wind_speed_10m;

      this.highestTemperature = Math.max(...temps);
      this.lowestTemperature = Math.min(...temps);
      this.averageHumidity =
        humidity.reduce((sum: any, h: any) => sum + h, 0) / humidity.length;
      this.maxWindSpeed = Math.max(...wind);
    }
  }

  getLoc(): void {
    if (!('geolocation' in navigator)) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        // Initialize map first!
        this.mapService.initMap(latitude, longitude, 'map');

        // Then show user location marker
        setTimeout(() => {
          this.mapService.showUserLocation(latitude, longitude);
        }, 100);

        this.weatherService.getCityFromLatLong(latitude, longitude).subscribe({
          next: (data) => {
            this.city = data.address.city;
            this.displayName = data.display_name;
            this.getWeatherData(true);
          },
          error: () => {
            this.errorMessage = 'Unable to detect city from location.';
          },
        });
      },
      () => {
        this.errorMessage = 'Unable to get location.';
      }
    );
  }

  onCitySelected(city: string): void {
    this.city = city;
    this.getWeatherData();
  }

  openChartModal(): void {
    this.showChartModal = true;
    this.prepareChartData();
  }

  closeChartModal(): void {
    this.showChartModal = false;
    this.reset();
  }

  setRange(hours: number): void {
    this.selectedRange = hours;
    this.prepareChartData();
  }

  onCustomRangeChange(value: number): void {
    this.customRangeInput = value;
  }

  applyCustomRange(): void {
    const val = this.customRangeInput;
    if (val && val > 0 && val <= 168) {
      this.selectedRange = val;
      this.prepareChartData();
    } else {
      alert('Please enter a value between 1 and 168 hours.');
    }
  }

  reset(): void {
    this.customRangeInput = null;
    this.selectedRange = 72;
    this.prepareChartData();
  }

  ngAfterViewInit() {
    // this.prepareChartData();
  }

  prepareChartData(): void {
    const range = this.hoursToShow;
    const now = new Date();
    const startIndex = this.cityData.hourly.time.findIndex(
      (t: string) => new Date(t) >= now
    );
    this.futureTime = startIndex;
    const timeSlice = this.cityData.hourly.time.slice(
      startIndex,
      startIndex + range
    );
    this.lineChartData.labels = timeSlice.map((t: string) =>
      this.formatDate(t)
    );

    this.lineChartData.datasets[0].data = this.cityData.hourly.temperature_2m
      .slice(startIndex, startIndex + range)
      .map((t: number) => this.convertTemp(t));

    this.lineChartData.datasets[1].data =
      this.cityData.hourly.relative_humidity_2m.slice(
        startIndex,
        startIndex + range
      );

    this.lineChartData.datasets[2].data =
      this.cityData.hourly.wind_speed_10m.slice(startIndex, startIndex + range);

    this.chart?.update();
  }

  chartType: 'line' = 'line';

  setChartType(type: 'line') {
    this.chartType = type;
    this.chart?.update();
  }

  getWeatherIcon(temp: number): string {
    const temperature = typeof temp === 'string' ? parseFloat(temp) : temp;
    return temperature > 30 ? 'assets/sun.jpg' : 'assets/cloud.jpg';
  }
  exportChartAsImage() {
    const base64 = this.chart?.chart?.toBase64Image();
    const link = document.createElement('a');
    link.href = base64!;
    link.download = `${this.city}_chart.png`;
    link.click();
  }
  getWeatherByLatLong(lat: number, lng: number): void {
    this.loading = true;
    this.errorMessage = '';
    this.cityData = {};

    this.weatherService.getCityFromLatLong(lat, lng).subscribe({
      next: (data) => {
        this.city =
          [
            data.address?.hamlet,
            data.address?.village,
            data.address?.county,
            data.address?.state,
          ]
            .filter(Boolean)
            .join(', ') || 'Unknown';

        this.name = this.city;
        this.country = data.address.country || '';
        this.displayName = data.display_name;

        this.weatherService.callWeatherAPI(lat, lng).subscribe({
          next: (weatherData) => {
            this.cityData = weatherData;
            this.calculateWeatherStats();
            this.loading = false;
            this.prepareChartData();

            // Show marker for selected point
            this.mapService.addMarker(
              lat,
              lng,
              this.city,
              this.cityData.hourly.temperature_2m[0],
              this.cityData.hourly.relative_humidity_2m[0]
            );
          },
          error: () => {
            this.errorMessage = 'Error fetching weather.';
            this.loading = false;
          },
        });
      },
      error: () => {
        this.errorMessage = 'Error getting city from lat/lng.';
        this.loading = false;
      },
    });
  }
  showMap = false;

  toggleMap() {
    this.showMap = !this.showMap;
  }

  getFutureDate(time: string[]): number {
    const now = new Date();
    return time.findIndex((t: string) => new Date(t) >= now);
  }

  upadateStartIndex(): void {
    this.futureTime = this.getFutureDate(this.cityData.hourly.time);
  }
  selectedTimeFilter: string = '';

  applyTimeFilter(): void {
    const now = new Date();
    const timeList: string[] = this.cityData.hourly?.time || [];
    const startIndex = timeList.findIndex((t) => new Date(t) >= now);

    if (startIndex === -1) {
      this.futureTime = 0;
      this.hoursToShow = 0;
      return;
    }

    this.futureTime = startIndex;

    switch (this.selectedTimeFilter) {
      case '6h':
        this.hoursToShow = 6;
        break;
      case '12h':
        this.hoursToShow = 12;
        break;
      case 'restOfDay': {
        const currentDate = now.getDate();
        let count = 0;
        for (let i = startIndex; i < timeList.length; i++) {
          if (new Date(timeList[i]).getDate() === currentDate) {
            count++;
          } else break;
        }
        this.hoursToShow = count;
        break;
      }
      case 'tomorrow': {
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        let count = 0;
        for (let i = startIndex; i < timeList.length; i++) {
          if (new Date(timeList[i]).getDate() === tomorrow.getDate()) {
            count++;
            if (count === 1) this.futureTime = i;
          } else if (count > 0) break;
        }
        this.hoursToShow = count;
        break;
      }
      case 'custom':
        break;
    }

    this.prepareChartData();
  }
  getDailySummary() {
    const grouped: { [date: string]: any[] } = {};

    this.cityData.hourly.time.forEach((timeStr: string, i: number) => {
      const date = new Date(timeStr).toISOString().split('T')[0]; // 'YYYY-MM-DD'

      if (!grouped[date]) {
        grouped[date] = [];
      }

      grouped[date].push({
        time: timeStr,
        temp: this.cityData.hourly.temperature_2m[i],
        humidity: this.cityData.hourly.relative_humidity_2m[i],
        wind: this.cityData.hourly.wind_speed_10m[i],
      });
    });

    this.dailySummaries = Object.entries(grouped).map(([date, entries]) => {
      const temps = entries.map((e) => e.temp);
      const humidity = entries.map((e) => e.humidity);
      const wind = entries.map((e) => e.wind);

      return {
        date,
        weekday: new Date(date).toLocaleDateString('en-IN', {
          weekday: 'long',
        }),
        maxTemp: Math.max(...temps),
        minTemp: Math.min(...temps),
        avgHumidity: Math.round(
          humidity.reduce((a, b) => a + b, 0) / humidity.length
        ),
        maxWind: Math.max(...wind),
      };
    });
  }

  currentDayIndex = 0;

  getDailyDataForCurrentIndex() {
    const dailyTemps = this.getDailyTemperature();
    return dailyTemps?.[this.currentDayIndex];
  }

  canGoNext(): boolean {
    return this.currentDayIndex < (this.getDailyTemperature()?.length ?? 0) - 1;
  }
  canGoPrev(): boolean {
    return this.currentDayIndex > 0;
  }
  nextDay(): void {
    if (this.canGoNext()) {
      this.currentDayIndex++;
    }
  }
  prevDay(): void {
    if (this.canGoPrev()) {
      this.currentDayIndex--;
    }
  }
}
