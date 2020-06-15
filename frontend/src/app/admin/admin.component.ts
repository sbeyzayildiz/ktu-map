import GeoJSON from 'ol/format/GeoJSON';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { HomeComponent, MapState } from '../home/home.component';
import Draw from 'ol/interaction/Draw';
import GeometryType from 'ol/geom/GeometryType';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Polygon from 'ol/geom/Polygon';
import MultiPolygon from 'ol/geom/MultiPolygon';
import { Feature } from 'ol';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MatSnackBar } from '@angular/material';
import { Modify, Select } from 'ol/interaction';
import { ModifyEvent } from 'ol/interaction/Modify';
import { singleClick } from 'ol/events/condition';
import { first } from 'rxjs/operators';
// enum MapState {
//   DRAW_STARTED = 'DRAW_STARTED',
//   DEFAULT = 'DEFAULT',
//   DRAW_ENDED = 'DRAW_ENDED',
//   DRAW_EDIT = 'DRAW_EDIT',
//   DRAW_EDIT_ENDED = 'DRAW_EDIT_ENDED',
//   DELETE = 'DELETE'

// }
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
  // currentMapState: MapState = MapState.DEFAULT;
  modify: Modify;
  editUnitId = 0;
  lastModifiedFetaure;
  selectedFeatureOldGeom;
  constructor(
    private homeComponent: HomeComponent,
    private router: Router,
    private httpClient: HttpClient,
    private activatedRoute: ActivatedRoute,
    private snackbar: MatSnackBar
  ) { }
  ngOnInit() {
    this.vectorLayer = new VectorLayer({
      source: new VectorSource()
    });
    this.homeComponent.map.addLayer(this.vectorLayer);
    (window as any).admincomp = this;
  }

  editUnit() {
    this.snackbar.open('Birim seçin!')
    let selectedFeature: Feature<MultiPolygon> = null;
    let selectedFeatureOldGeom: MultiPolygon;
    this.homeComponent.selectPointerMove.setActive(false);
    const select = new Select({
      condition: singleClick
    });
    this.homeComponent.map.addInteraction(select);
    const modify = new Modify({
      features: select.getFeatures(),
    });

    select.on('select', e => {
      if (e.selected.length !== 1) {
        console.log('OLMADI')
        return;
      }
      selectedFeature = e.selected[0] as any;
      selectedFeatureOldGeom = selectedFeature.getGeometry().clone();
      this.selectedFeatureOldGeom = selectedFeature.getGeometry().clone();
      select.setActive(false);
    })
    this.homeComponent.map.addInteraction(modify);

    modify.on('modifyend', (event: ModifyEvent) => {
      this.lastModifiedFetaure = selectedFeature;
    })
    modify.on('modifystart', (event: ModifyEvent) => {
      if (select.getFeatures().getArray()[0].get('id')) {

      }
    })
    this.modify = modify;
    this.changeState(MapState.DRAW_EDIT)
  }

  deleteUnit() {
    this.activatedRoute.queryParams.pipe(first()).subscribe((params) => {
      if(!params.unit_id) {
        this.snackbar.open('Birim Seçiniz')
        return;
      }
      this.router.navigate(['delete'], {
        relativeTo: this.activatedRoute,
        queryParams: {
          'unit_id': params.unit_id,
        },
        queryParamsHandling: 'merge'
      })
    })
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

  changeState(newState: MapState) {
    const oldState = this.homeComponent.currentMapState;
    if (newState === oldState) {
      return;
    }
    console.log('STATE: eski', oldState);
    console.log('STATE: yeni', newState);

    if (newState === MapState.DRAW_EDIT) {
      // this.modify.setActive(true);
    } else if (newState === MapState.DEFAULT) {
      if (oldState === MapState.DRAW_STARTED) {
        this.removeDraw();
      }
      if (oldState === MapState.DRAW_EDIT) {
      }
    } else if (newState === MapState.DELETE) {

    }

    if (oldState === MapState.DRAW_EDIT) {
      this.modify.setActive(false);
      this.homeComponent.selectPointerMove.setActive(true);

    }
    this.homeComponent.currentMapState = newState;
  }

  removeDraw() {
    this.homeComponent.map.removeInteraction(this.draw);
    this.vectorLayer.getSource().clear();
    this.draw = null;
  }
  saveDraw() {
    if (this.homeComponent.currentMapState === MapState.DRAW_STARTED) {
      this.getUnitAddComponent();
    }
    if (this.homeComponent.currentMapState === MapState.DRAW_EDIT) {
      this.updateUnitGeom();
    }
  }
  ngOnDestroy() {
    this.homeComponent.map.removeLayer(this.vectorLayer);
  }

  logout() {
    window.localStorage.removeItem('token');
    this.router.navigate(['..']);
    window.location.reload();
  }

  getUnitAddComponent() {
    this.router.navigate(['add'], { relativeTo: this.activatedRoute });
  }

  getDrawedGeometryAsGeojson() {
    const features = this.vectorLayer.getSource().getFeatures();
    const polygons = features.map(f => f.getGeometry() as Polygon);
    const multiPolygon = new MultiPolygon(polygons).clone().transform('EPSG:3857', 'EPSG:4326');
    console.log('MULTI POLYGON', multiPolygon);
    const f = new Feature(multiPolygon);
    const json = new GeoJSON().writeFeature(f)
    return JSON.parse(json).geometry;
  }

  updateUnitGeom() {
    console.log('Updated Features: ', this.lastModifiedFetaure)
    const geometry = this.lastModifiedFetaure.getGeometry().clone().transform('EPSG:3857', 'EPSG:4326')
    const body = {
      geom: JSON.parse(new GeoJSON().writeGeometry(geometry))
    };
    const unit_id = this.lastModifiedFetaure.get('id')
    this.httpClient.put(environment.apiUrl + 'unit/' + unit_id + '/geom', body).subscribe((response) => {
      this.snackbar.open('Güncelleme Başarılı');
      this.changeState(MapState.DEFAULT);
    }, (error) => {
      console.log(error);

      this.snackbar.open('Güncelleme Başarısız')
    });


  }

  cancelEdit() {
    if(this.lastModifiedFetaure) {
      this.lastModifiedFetaure.setGeometry(this.selectedFeatureOldGeom);
    }
    this.changeState(MapState.DEFAULT)
  }

  

}
