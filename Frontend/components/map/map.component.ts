import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import TileImage from 'ol/source/TileImage';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {

  constructor() { }

  _view: View;
  _map: Map;
  // @ViewChild('olMap') olMap: ElementRef;
  ngOnInit(): void {
    this.createMap(document.getElementById('olMap'));
    this.createBaseMaps();
  }

  createMap(mapElement) {
    this._view = new View({
      center: [3900100, 4650000],
      zoom: 6.8,
      minZoom: 6,
      maxZoom: 20,
    });
    this._map = new Map({
      target: mapElement,
      view: this._view
    });

    this._map.getView().setMinZoom(6.8);

  }

  createBaseMaps() {
    const googleRoad = new TileLayer({
      source: new TileImage({ url: 'http://mt1.google.com/vt/lyrs=m@113&hl=tr&&x={x}&y={y}&z={z}' }),
      visible: true
    });
    const googleHybrit = new TileLayer({
      source: new TileImage({ url: 'http://mt1.google.com/vt/lyrs=y@113&hl=tr&&x={x}&y={y}&z={z}' }),
      visible: false
    });
    const googleSat = new TileLayer({
      source: new TileImage({ url: 'http://mt1.google.com/vt/lyrs=s@13&hl=tr&&x={x}&y={y}&z={z}' }),
      visible: false
    });
    this._map.addLayer(googleRoad);
    this._map.addLayer(googleHybrit);
    this._map.addLayer(googleSat);
  }

}
