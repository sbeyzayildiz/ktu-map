import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { View, Map, Feature } from 'ol';
import { Router, ActivatedRoute } from '@angular/router';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { Circle as CircleStyle } from 'ol/style';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import GeoJSON from 'ol/format/GeoJSON';
import Select from 'ol/interaction/Select';
import { pointerMove } from 'ol/events/condition';
import { getMatIconFailedToSanitizeUrlError } from '@angular/material';
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
  sidebarVisibility: boolean;
  @ViewChild('drawer', { static: false })
  drawer: MatSidenav;
  @ViewChild('sidenav', { static: true }) sidenav: MatSidenav;
  @ViewChild('map', { static: true }) mapRef: ElementRef<HTMLDivElement>;
  unitList: Array<Unit>;
  reason = '';
  coordinates = [];
  dataSource;
  unit_id: number;
  selectedUnit: Unit;
  map: Map;
  adminActive = false;
  vectorLayer: VectorLayer;
  stateCtrl = new FormControl();
  selectedFeature = null;
  unitName = null;
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
  close(reason: string) {
    this.reason = reason;
    this.sidenav.close();
  }

  ngOnInit() {
    this.sidebarVisibility = this.activatedRoute.snapshot.queryParams.sidebar === 'open';
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.sidebar) {
        this.sidebarVisibility = queryParams.sidebar === 'open';
      }
    });
    this.initMap();
    this.getUnits();
    // this.postUnit();
    const highlightStyle = new Style({
      fill: new Fill({
        color: 'rgba(255,255,255,0.7)'
      }),
      stroke: new Stroke({
        color: '#3399CC',
        width:5
      }),
      
    })
    // const selectPointerMove = new Select({
    //   condition: pointerMove,
    //   style: highlightStyle,
    //   // TODO: fetaurelar filter edilecek
    // })
    // this.map.addInteraction(selectPointerMove)
    this.map.on('pointermove', (e) => {
      if (this.selectedFeature !== null) {
        this.selectedFeature.setStyle(undefined);
        this.selectedFeature = null;
      }
      this.unitName = null;
      this.map.forEachFeatureAtPixel(e.pixel, (f: any) => {
        this.selectedFeature = f;
        const unitName = f.values_.name;
        if(unitName !== "null") {
          f.setStyle(highlightStyle);
          console.log('UNit Name: ', f.values_.name);
          this.unitName = unitName;
          return true;
        } 
        return;
      })
    })

  }

  changeSidebarVisibility() {
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


  initMap() {
    const raster = new TileLayer({
      source: new OSM()
    });
    const source = new VectorSource();
    this.vectorLayer = new VectorLayer({
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
      layers: [raster, this.vectorLayer],
      target: this.mapRef.nativeElement,
      view: new View({
        zoom: 15,
        // center: [3000000, 4000000],
        center: [4480000, 5000000],
        // 40.9947641,39.7735569
      }),
      controls: []
    });
    this.map = map;
  }

  getUnits() {
    this.httpClient.get(environment.apiUrl + 'unit').subscribe((response: Array<Unit>) => {
      this.unitList = response;
      const geoJson = new GeoJSON();
      const features = response.map((data) => {
        const multiPolygon = geoJson.readGeometry(data.geom).transform('EPSG:4326', 'EPSG:3857')
        const f = new Feature(multiPolygon);
        f.setId(data.id);
        f.setProperties(data);
        return f;

      });
      this.vectorLayer.getSource().addFeatures(features);
    })
  }

  getViewUnit(unit: Unit) {
    this.httpClient.get(environment.apiUrl + 'unit/' + unit.id).subscribe((response: Unit) => {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {
          'unit_id': unit.id,
          'sidebar': 'open'
        },
        queryParamsHandling: 'merge'
      });
      this.selectedUnit = response;
      const feature = this.vectorLayer.getSource().getFeatureById(unit.id)
      if (!feature) {
        return;
      }

      this.map.getView().fit(feature.getGeometry().getExtent(), {
        duration: 250,
        padding: [40, 40, 40, 40],
        maxZoom: 20,
      })
    })
  }

  postUnit() {
    this.httpClient.post(environment.apiUrl + 'unit', {
      name: 'Endüstri Mühendisliği',
      category_id: 3,
      parent_unit_id: 2, //mühendislik fakültesi 
      description: 'Ktü yazılım müh',
      website: 'ktu.edu.tr/ofyazilim',
      geom: {
        type: 'Polygon',
        coordinates: [[
          [40.24604822327501, 40.909869288855646],
          [40.25222803284533, 40.90980442308114],
          [40.25038267304308, 40.91304763385392],
          [40.24604822327501, 40.909869288855646]
        ]],
        crs: { type: 'name', properties: { name: 'EPSG:4326' } }
      }
    }).subscribe((response) => {
      this.getUnits()

    })
  }




}
