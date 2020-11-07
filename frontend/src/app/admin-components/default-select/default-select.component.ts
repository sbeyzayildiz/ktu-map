import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { HomeComponent } from 'src/app/home/home.component';
// import { AdminComponent } from 'src/app/admin/admin.component';
import { Style, Fill, Stroke } from 'ol/style';
import { Select } from 'ol/interaction';
import { pointerMove } from 'ol/events/condition';
import { SelectEvent } from 'ol/interaction/Select';
import { Feature, MapBrowserEvent } from 'ol';

@Component({
  selector: 'app-default-select',
  templateUrl: './default-select.component.html',
  styleUrls: ['./default-select.component.scss']
})
export class DefaultSelectComponent implements OnInit, OnDestroy {

  @Output('featureHighlight')
  featureHightlightEventEmitter = new EventEmitter<Feature>();
  @Output('featureSelect')
  featureSelectEventEmitter = new EventEmitter<Feature>();
  selectPointerMove: Select;
  constructor(
    private homeComponent: HomeComponent,
    // private adminComponent: AdminComponent,
  ) { }

  ngOnInit() {
    const map = this.homeComponent.map;
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
    selectPointerMove.on('select', this.pointerMoveSelectFunction)
    map.addInteraction(selectPointerMove);
    this.selectPointerMove = selectPointerMove;

    map.on('singleclick', this.onMapSingleClickFunction);
  }
  private pointerMoveSelectFunction = (e: SelectEvent) => {
    if (e.selected.length > 0) {
      const feature = e.selected[0];
      this.featureHightlightEventEmitter.emit(feature);
    } else {
      // this.unitName = null
      this.featureHightlightEventEmitter.emit(null);
    }
  }
  private onMapSingleClickFunction = (e: MapBrowserEvent) => {
    const map = this.homeComponent.map;
    const features = map.getFeaturesAtPixel(e.pixel);
    if (features.length === 0) {
      this.featureSelectEventEmitter.emit(null);
      return;
    }
    this.featureSelectEventEmitter.emit(features[0] as Feature);
  }
  ngOnDestroy() {
    const map = this.homeComponent.map;
    map.removeInteraction(this.selectPointerMove);
    map.un('singleclick', this.onMapSingleClickFunction);
  }
}
