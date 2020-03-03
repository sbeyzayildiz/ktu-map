import { createStringXY } from 'ol/coordinate';
import MousePosition from 'ol/control/MousePosition';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import {defaults as defaultControls} from 'ol/control';
import { fromLonLat } from 'ol/proj';
@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit {
  @ViewChild('olMap', {static: true}) olMapEl: ElementRef<HTMLDivElement>;
  constructor() { }

  view: View;
  map: Map;

  ngOnInit(): void {
    this.createMap(this.olMapEl.nativeElement);
  }

  createMap(mapElement) {
    this.map = new Map({
      target: mapElement,
     layers : [ new TileLayer({
        source: new OSM()
      })],
      view: new View({
        center: fromLonLat([39.7710, 40.9952]),
        zoom: 17
      }),
      controls: defaultControls([]).extend([
        new MousePosition({
          coordinateFormat: createStringXY(4),
          projection: 'EPSG:4326',
          // comment the following two lines to have the mouse position
          // be placed within the map.
          className: 'custom-mouse-position',
          target: document.getElementById(mapElement),
          undefinedHTML: '&nbsp;'
        })
      ])
    });
  }

}
