import * as L from 'leaflet';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class MapService {
  private map!: L.Map;
  private currentMarker!: L.Marker;
  private userLocationMarker!: L.Marker;

  initMap(
    lat: number,
    lng: number,
    containerId: string = 'map',
    onClickCallback?: (lat: number, lng: number) => void
  ): L.Map {
    if (this.map) this.map.remove();

    this.map = L.map(containerId).setView([lat, lng], 10);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    if (onClickCallback) {
      this.map.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        onClickCallback(lat, lng);
      });
    }

    return this.map;
  }

  addMarker(
    lat: number,
    lng: number,
    city: string,
    temp: string,
    humidity: string,
    iconUrl?: string
  ) {
    if (this.currentMarker) {
      this.map.removeLayer(this.currentMarker);
    }

    const icon = L.icon({
      iconUrl: iconUrl || 'assets/pin.png',
      iconSize: [30, 40],
      iconAnchor: [15, 40],
      popupAnchor: [0, -30],
    });

    this.currentMarker = L.marker([lat, lng], { icon }).addTo(this.map);

    this.currentMarker
      .bindPopup(`<b>${city}</b><br>Temp: ${temp}°C<br>Humidity: ${humidity}%`)
      .openPopup();
  }

  showUserLocation(lat: number, lng: number): void {
    // Remove old user location marker if it exists
    if (this.userLocationMarker) {
      this.map.removeLayer(this.userLocationMarker);
    }

    // Create a distinct blue pin icon
    const blueIcon = L.icon({
      iconUrl: 'assets/pin.png', // ✅ use a proper blue location marker
      iconSize: [20, 20],
      iconAnchor: [10, 10],
      popupAnchor: [0, -10],
    });

    // Add the marker to the map
    this.userLocationMarker = L.marker([lat, lng], { icon: blueIcon })
      .addTo(this.map)
      .bindPopup('📍 You are here')
      .openPopup();

    // Center the map on user's location
    this.map.setView([lat, lng], 12);
  }
}
