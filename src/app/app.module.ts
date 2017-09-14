import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { EsriLoaderModule } from 'angular-esri-loader';
import { AppComponent } from './app.component';
import { EsriMapComponent } from './esri-map/esri-map.component';

@NgModule({
  declarations: [
    AppComponent,
    EsriMapComponent
  ],
  imports: [
    BrowserModule,
    EsriLoaderModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
