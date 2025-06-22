import { Component } from '@angular/core';
// import { ChartType } from 'chart.js';
import type { ChartConfiguration, ChartOptions, ChartType } from 'chart.js';
// import { BaseChartDirective } from 'ng2-charts';
import { BaseChartDirective, provideCharts, withDefaultRegisterables } from 'ng2-charts';
import { Chart } from 'chart.js/auto';
import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-app-my-chart',
  imports: [BaseChartDirective],
  templateUrl: './app-my-chart.component.html',
  styleUrl: './app-my-chart.component.css'
})
export class AppMyChartComponent {
  chartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: []
  };

  chartOptions: ChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: 'top' },
      title: { display: true, text: 'Next 24h Temperature (°C)' }
    },
    scales: {
      y: { title: { display: true, text: '°C' } },
      x: { title: { display: true, text: 'Time (UTC)' } }
    }
  };

  constructor(private http: HttpClient) {}
  ngOnInit() {
    const url = 'https://api.open-meteo.com/v1/forecast?latitude=29.22254&longitude=79.5286&hourly=temperature_2m';

    this.http.get<any>(url).subscribe((data) => {
      const labels = data.hourly.time.slice(0, 24); // first 24 hours
      const temps = data.hourly.temperature_2m.slice(0, 24);

      this.chartData = {
        labels: labels.map((t: string) => t.slice(11)), // show only time like "12:00"
        datasets: [
          {
            label: 'Temp (°C)',
            data: temps,
            borderColor: 'red',
            backgroundColor: 'rgba(255,0,0,0.2)',
            fill: true,
            tension: 0.4
          }
        ]
      };
    });
  }
}
