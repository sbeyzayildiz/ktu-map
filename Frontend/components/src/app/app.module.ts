import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { MapComponent } from '../../map/map.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { ControlBarComponent } from './control-bar/control-bar.component';
@NgModule({
  declarations: [
    AppComponent,
    MapComponent,
    SearchBarComponent,
    ControlBarComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
