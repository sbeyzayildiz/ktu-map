import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { HomeComponent } from 'src/app/home/home.component';
import { AdminComponent } from 'src/app/admin/admin.component';
import { Select, Modify } from 'ol/interaction';
import { singleClick } from 'ol/events/condition';
import { Feature, Collection } from 'ol';
import Geometry from 'ol/geom/Geometry';
import { SelectEvent } from 'ol/interaction/Select';
import { ModifyEvent } from 'ol/interaction/Modify';
@Component({
  selector: 'app-edit-geometry',
  templateUrl: './edit-geometry.component.html',
  styleUrls: ['./edit-geometry.component.scss']
})
export class EditGeometryComponent implements OnInit, OnDestroy {

  @Output('modifyEnd')
  modifyEndEventEmitter = new EventEmitter<Feature>();

  select: Select = null;
  modify: Modify = null;
  selectedFeature: Feature = null;
  selectedGeometry: Geometry = null;
  constructor(
    private homeComponent: HomeComponent,
    private adminComponent: AdminComponent,
  ) { }

  ngOnInit() {
    const map = this.homeComponent.map;
    const select = new Select({
      condition: singleClick,
      
    });
    map.addInteraction(select);
    select.on('select', this.onSelect);
    this.select = select;


  }
  ngOnDestroy() {
    const map = this.homeComponent.map;
    map.removeInteraction(this.select);
    this.removeModify();
    this.resetSelectedFeatureGeometry();
  }
  onSelect = (e: SelectEvent) => {
    if (e.selected.length !== 1) {
      this.removeModify();
      return;
    }
    
    this.resetSelectedFeatureGeometry();
    const selectedFeature = e.selected[0] as Feature
    this.selectedFeature = selectedFeature;
    this.selectedGeometry = selectedFeature.getGeometry().clone();
    this.addModify(selectedFeature);


  }
  modifyEnd = (event: ModifyEvent) => {
    const features = event.features.getArray();
    if (features.length !== 1) {
      return;
    }
    const feature = features[0].clone();
    this.modifyEndEventEmitter.emit(feature)
  }
  private addModify = (feature: Feature) => {
    this.removeModify();
    const map = this.homeComponent.map;
    const modify = new Modify({
      features: new Collection([feature]),
    });
    modify.on('modifyend', this.modifyEnd);
    // modify.on('modifystart', this.modifyStart);
    map.addInteraction(modify);
    this.modify = modify;
  }
  private removeModify = () => { 
    if(!this.modify) {
      return;
    }
    const map = this.homeComponent.map;
    map.removeInteraction(this.modify);
    this.modify = null;
  }
  private resetSelectedFeatureGeometry() {
    if (this.selectedFeature) {
      // console.log('eski geom bulduk kanki ağzını kıram onun')
      this.selectedFeature.setGeometry(this.selectedGeometry);
      this.selectedGeometry = null;
      this.selectedFeature = null;
    }
  }

}
