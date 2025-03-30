import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgFor, NgIf } from '@angular/common';
import { CityService } from '../../city-service.service';

@Component({
  selector: 'app-city-search',
  standalone: true,
  imports: [FormsModule, NgFor, NgIf],
  templateUrl: './city-search.component.html',
  styleUrls: ['./city-search.component.css']
})
export class CitySearchComponent implements OnInit {
  city: string = '';
  searchText: string = '';
  filteredCityList: string[] = [];
  cityList: string[] = [];

  @Output() citySelected = new EventEmitter<string>();

  constructor(private cityService: CityService) {}

  ngOnInit() {
    this.cityService.getCities().subscribe(cities => {
      this.cityList = cities.map(city => city.name); // Extract only city names
    });
  }

  // onInputChange() {
  //   if (this.searchText.length > 0) {
  //     this.filteredCityList = this.cityList.filter(c =>
  //       c.toLowerCase().includes(this.searchText.toLowerCase())
  //     );
  //   } else {
  //     this.filteredCityList = [];
  //   }
  // }
  onInputChange() {
  if (this.searchText.length > 0) {
    const lowerSearch = this.searchText.toLowerCase();
    this.filteredCityList = this.cityList.filter(c => c.toLowerCase().includes(lowerSearch)).slice(0, 10); // Limit to 10 results
  } else {
    this.filteredCityList = [];
  }
}


  selectedCityDetails(city: string) {
    this.searchText = city;
    this.filteredCityList = [];
    this.citySelected.emit(city);
  }

  highlightMatch(city: string): string {
    if (!this.searchText) return city;
    const regex = new RegExp(this.searchText, 'gi');
    return city.replace(regex, match => `<mark>${match}</mark>`);
  }

  clearSearch() {
    this.searchText = ''; // Clear input
    this.filteredCityList = []; // Clear suggestions
     this.citySelected.emit('');
  }
}
