import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { View, Map } from 'ol';
import { Router, ActivatedRoute } from '@angular/router';
import TileLayer from 'ol/layer/Tile';
// Tile WMS
import OSM from 'ol/source/OSM';
import { defaults, MousePosition } from 'ol/control';
import { createStringXY } from 'ol/coordinate';
import Draw, { DrawEvent } from 'ol/interaction/Draw';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Point from 'ol/geom/Point';
import { toStringXY } from 'ol/coordinate';
import GeometryType from 'ol/geom/GeometryType';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { Circle as CircleStyle } from 'ol/style';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { MatTableDataSource } from '@angular/material';
import { State } from 'ol/View';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import {map, startWith} from 'rxjs/operators';
interface Unit {
  id: number;
  name: string;
  category_id: number;
  geom;
  parent_unit_id: number;
  description: string;
  telephone: string;
  website: string;
}
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  showFiller = false;
  filteredStates: Observable<Unit[]>;
  stateCtrl = new FormControl();
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient
  ) { 
    this.filteredStates = this.stateCtrl.valueChanges
    .pipe(
      // startWith(''),
      map(unit => unit ? this._filterStates(unit) : this.unitList.slice())
    );
  }
  private _filterStates(value: string): Unit[] {
    const filterValue = value.toLowerCase();

    return this.unitList.filter(state => state.name.toLowerCase().indexOf(filterValue) === 0);
  }
  sidebarVisibility: boolean;
  @ViewChild('drawer', { static: false })
  drawer: MatSidenav;
  @ViewChild('sidenav', { static: true }) sidenav: MatSidenav;
  @ViewChild('map',  {static: false}) mapRef: ElementRef<HTMLDivElement>;
  unitList: Array<Unit>;
  reason = '';
  coordinates = [];
  dataSource;
  close(reason: string) {
    this.reason = reason;
    this.sidenav.close();
  }

  ngOnInit() {
    this.sidebarVisibility = this.activatedRoute.snapshot.queryParams.sidebar !== 'open';
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.sidebar) {
        this.sidebarVisibility = queryParams.sidebar === 'open';
      }
    });
    setTimeout(() => {
      this.getMap();
      
    }, 1000);
    this.getUnits();
    // this.postUnit();
  }

  changeSidebarVisibility() {
    console.log(this.sidebarVisibility);
    const newState = this.sidebarVisibility ? 'close' : 'open';
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { sidebar: newState },
      queryParamsHandling: 'merge'
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }


  getMap() {
    const raster = new TileLayer({
      source: new OSM()
    });
    const source = new VectorSource();
    const vector = new VectorLayer({
      source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: 'red',
          width: 2
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: 'red'
          })
        })
      })
    });

    const map = new Map({
      layers: [raster, vector],
      target: this.mapRef.nativeElement,
      view: new View({
        zoom: 15,
        // center: [3000000, 4000000],
        center: [4480000, 5000000],
        // 40.9947641,39.7735569
      }),
      controls: []
    });
    // const draw = new Draw({
    //   source,
    //   type: GeometryType.POINT,
    //   maxPoints: 1,
    //   minPoints: 0,
    // });
    // draw.on('drawstart', (event: DrawEvent) => {
    //   source.clear();
    // });
    // draw.on('drawend', (event: DrawEvent) => {
    //   // console.log(event);
    //   const point = event.feature.getGeometry().clone() as Point;
    //   const transformed = point.transform('EPSG:3857', 'EPSG:4326') as Point;
    //   // console.log(transformed.getCoordinates());
    //   this.coordinates = transformed.getCoordinates();
    // });
    // map.addInteraction(draw);
  }
  getUnits() {
    this.httpClient.get(environment.apiUrl + 'unit').subscribe((response: Array<Unit>) => {
      console.log('unitss response ', response)
      this.unitList = response;
    })
  
  }

  getViewUnit(unit: Unit) {
    this.httpClient.get(environment.apiUrl + 'unit').subscribe((response: Unit) => {
      console.log('unit response ', response)
    })
  }

  postUnit() {
    this.httpClient.post(environment.apiUrl + 'unit', {
      name: 'Yazılım Mühendisliği',
      category_id: 3,
      parent_unit_id: 2, //mühendislik fakültesi 
      description: 'Ktü yazılım müh',
      website: 'ktu.edu.tr/ofyazilim',
      geom: {
        type: 'Polygon',
        coordinates: [
            [
                [100.0, 0.0],
                [101.0, 0.0],
                [101.0, 1.0],
                [100.0, 1.0],
                [100.0, 0.0]
            ]
        ],
        crs: { type: 'name', properties: { name: 'EPSG:4326' } }
      }
    }).subscribe((response) => {
      console.log('unit POST:::::', response)
      this.getUnits()

    })
  }

 
}
