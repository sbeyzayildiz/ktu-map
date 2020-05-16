import GeoJSON from 'ol/format/GeoJSON';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { HomeComponent } from '../home/home.component';
import Draw from 'ol/interaction/Draw';
import Geometry from 'ol/geom/Geometry';
import GeometryType from 'ol/geom/GeometryType';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Polygon from 'ol/geom/Polygon';
import MultiPolygon from 'ol/geom/MultiPolygon';
import { Feature } from 'ol';
import { Router } from '@angular/router';
enum MapState {
  DRAW_STARTED,
  DEFAULT,
  DRAW_ENDED

}
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit, OnDestroy {
  draw: Draw = null;
  MapState = MapState;
  unitSelected = false;
  vectorLayer: VectorLayer;
  currentMapState: MapState = MapState.DEFAULT;
  constructor(
    private homeComponent: HomeComponent,
    private router: Router
  ) { }
  ngOnInit() {
    this.vectorLayer = new VectorLayer({
      source: new VectorSource()
    });
    this.homeComponent.map.addLayer(this.vectorLayer);
    (window as any).admincomp = this;
  }

  selectUnit() {
    console.log('seçmeye başla!')
  }
  editUnit() {

  }
  deleteUnit() {

  }

  startDraw() {
    const draw = new Draw({
      type: GeometryType.POLYGON,
      source: this.vectorLayer.getSource()
    });
    this.homeComponent.map.addInteraction(draw);
    this.draw = draw;
    this.changeState(MapState.DRAW_STARTED);
  }

  changeState(state: MapState) {
    if (this.currentMapState === MapState.DRAW_STARTED && state === MapState.DEFAULT) {
      this.removeDraw();
    }
    this.currentMapState = state;
    console.log('new state: ', this.currentMapState);

  }

  removeDraw() {
    this.homeComponent.map.removeInteraction(this.draw);
    this.vectorLayer.getSource().clear();
    this.draw = null;
  }

  saveDraw() {
    const features = this.vectorLayer.getSource().getFeatures();
    const polygons = features.map(f => f.getGeometry() as Polygon);
    const multiPolygon = new MultiPolygon(polygons).clone().transform('EPSG:3857', 'EPSG:4326');
    console.log('MULTI POLYGON', multiPolygon);
    const f = new Feature(multiPolygon);
    f.setProperties({
      patates: 11
    })
    const json = new GeoJSON().writeFeature(f)
    console.log('JSON', json)

  }
  ngOnDestroy() {
    this.homeComponent.map.removeLayer(this.vectorLayer);
  }

  logout() {
    window.localStorage.removeItem('token');
    this.router.navigate(['..']);
  }

}
