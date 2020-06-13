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
import { Circle as CircleStyle, Text } from 'ol/style';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/internal/Observable';
import { map } from 'rxjs/operators';
import GeoJSON from 'ol/format/GeoJSON';
import Select, { SelectEvent } from 'ol/interaction/Select';
import { pointerMove } from 'ol/events/condition';
import { FeatureLike } from 'ol/Feature';
import TileImage from 'ol/source/TileImage';
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
  selectPointerMove: Select;
  googleRoad: TileLayer;
  openStreetMap: TileLayer;
  isGoogleVisible: boolean;
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private httpClient: HttpClient,
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
  refreshBasemaps(isGoogleVisible: boolean) {
    this.googleRoad.setVisible(isGoogleVisible);
    this.openStreetMap.setVisible(!isGoogleVisible);
    this.isGoogleVisible = !isGoogleVisible;
  }
  ngOnInit() {
    this.googleRoad = new TileLayer({
      source: new TileImage({ url: 'http://mt{1-3}.google.com/vt/lyrs=s@13&hl=tr&&x={x}&y={y}&z={z}' }),
      visible: false,
    });
    this.openStreetMap = new TileLayer({
      source: new OSM(),
      visible: false
    });
    this.refreshBasemaps(true)
    this.sidebarVisibility = this.activatedRoute.snapshot.queryParams.sidebar === 'open';
    this.activatedRoute.queryParams.subscribe(queryParams => {
      if (queryParams.sidebar) {
        this.sidebarVisibility = queryParams.sidebar === 'open';
      }
      if (queryParams.basemap) {
        console.log('queryParams.basemap', queryParams.basemap);
        const state = queryParams.basemap === 'true';
        this.refreshBasemaps(state)
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
        width: 5
      })

    })
    const selectPointerMove = new Select({
      condition: pointerMove,
      style: highlightStyle,
    })
    selectPointerMove.on('select', (e: SelectEvent) => {
      if (e.selected.length > 0) {
        this.unitName = e.selected[0].get('name')
      } else {
        this.unitName = null
      }
    })
    this.map.addInteraction(selectPointerMove);
    this.selectPointerMove = selectPointerMove;

    this.map.on('singleclick', (e) => {
      this.unitName = null;
      this.map.forEachFeatureAtPixel(e.pixel, (f: any) => {
        this.selectedFeature = f;
        const unitName = f.get('name');
        this.unitName = unitName;
        console.log('UNit id: ', f.get('id'));

        this.getViewUnit(f.get('id'));
        return true;
      })
    });
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

    const source = new VectorSource();
    this.vectorLayer = new VectorLayer({
      source,
      style: new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: 'grey',
          width: 2
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: 'grey'
          })
        })
      })
    });

    this.vectorLayer.setStyle((f: FeatureLike) => {
      // console.log("f", f);
      if (f.getId() > 10) {
        return new Style({
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
          }),
          text: new Text({
            text: f.get('name'),
            font: '18px Arial',
            fill: new Fill({
              color: 'red'
            })

          })
        })
      }
      return new Style({
        fill: new Fill({
          color: 'rgba(255, 255, 255, 0.2)'
        }),
        stroke: new Stroke({
          color: 'blue',
          width: 2
        }),
        image: new CircleStyle({
          radius: 7,
          fill: new Fill({
            color: 'blue'
          })
        }),
        text: new Text({
          text: f.get('name'),
          font: '18px Arial',
          fill: new Fill({
            color: 'blue'
          })
        })
      })
      return undefined;

    })


    const map = new Map({
      // layers: [raster],
      layers: [this.openStreetMap, this.googleRoad, this.vectorLayer],
      target: this.mapRef.nativeElement,
      view: new View({
        zoom: 15,
        maxZoom: 21,
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
        if(data.name === 'null') {
          return;
        }
        const multiPolygon = geoJson.readGeometry(data.geom).transform('EPSG:4326', 'EPSG:3857')
        const f = new Feature(multiPolygon);
        f.setId(data.id);
        f.setProperties(data);

        return f;
      });
      this.vectorLayer.getSource().addFeatures(features);
    })
  }

  getViewUnit(id: number) {
    this.httpClient.get(environment.apiUrl + 'unit/' + id).subscribe((response: Unit) => {
      this.router.navigate([], {
        relativeTo: this.activatedRoute,
        queryParams: {
          'unit_id': id,
          'sidebar': 'open'
        },
        queryParamsHandling: 'merge'
      });
      this.selectedUnit = response;
      const feature = this.vectorLayer.getSource().getFeatureById(id)
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

  // postUnit() {
  //   this.httpClient.post(environment.apiUrl + 'unit', {
  //     name: 'Endüstri Mühendisliği',
  //     category_id: 3,
  //     parent_unit_id: 2, //mühendislik fakültesi 
  //     description: 'Ktü yazılım müh',
  //     website: 'ktu.edu.tr/ofyazilim',
  //     geom: {
  //       type: 'Polygon',
  //       coordinates: [[
  //         [40.24604822327501, 40.909869288855646],
  //         [40.25222803284533, 40.90980442308114],
  //         [40.25038267304308, 40.91304763385392],
  //         [40.24604822327501, 40.909869288855646]
  //       ]],
  //       crs: { type: 'name', properties: { name: 'EPSG:4326' } }
  //     }
  //   }).subscribe((response) => {
  //     this.getUnits()

  //   })
  // }

  enterSearchGetUnit(event: KeyboardEvent, unitId: number) {
    console.log('keyup: ', event);
  }

  changeViewMapBase() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        basemap: this.isGoogleVisible
      },
      queryParamsHandling: 'merge'
    });
  }

}
