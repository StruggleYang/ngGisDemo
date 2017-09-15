import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EsriLoaderService } from 'angular-esri-loader';
@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {
  @ViewChild('map') mapEl: ElementRef;
  // 地图初始变量
  map: any;

  constructor(private esriLoader: EsriLoaderService) { }

  ngOnInit() {
    // only load the ArcGIS API for JavaScript when this component is loaded
    return this.esriLoader.load({
      // use a specific version of the API instead of the latest
      // url: '//js.arcgis.com/3.18/'
      url: 'http://192.168.0.222/arcgis_js_api/library/3.17/3.17/init.js'
    }).then(() => {
      // load the map class needed to create a new map
      this.esriLoader.loadModules([
        'esri/map',
        'esri/layers/ArcGISTiledMapServiceLayer',
        'esri/toolbars/draw',
        'esri/symbols/SimpleMarkerSymbol',
        'esri/symbols/SimpleLineSymbol',
        'esri/symbols/PictureMarkerSymbol',
        'esri/geometry/Point',
        'esri/geometry/Polyline',
        'esri/geometry/Extent',
        'esri/layers/GraphicsLayer',
        'esri/symbols/PictureFillSymbol',
         'esri/symbols/CartographicLineSymbol',
         'esri/SpatialReference',
         'esri/InfoTemplate',
        'esri/graphic',
        'dojo',
        'dojo/_base/Color', 'dojo/dom', 'dojo/on', 'dojo/domReady!'
      ]).then(([
        Map, ArcGISTiledMapServiceLayer, Draw,
        SimpleMarkerSymbol, SimpleLineSymbol,
        PictureMarkerSymbol, Point, Polyline,
        Extent, GraphicsLayer,
        PictureFillSymbol, CartographicLineSymbol,
        SpatialReference, InfoTemplate,
        Graphic, dojo, Color, dom, on
      ]) => {
        // create the map at the DOM element in this component
        this.map = new Map(this.mapEl.nativeElement, {
          center: [114.1700615729523, 30.597683710794332], // 地图初始中心点
          zoom: 15, // 缩放比例
          logo: false, // 隐藏logo
          // slider:false // 隐藏侧边缩放工具
          // basemap: 'osm'
        });
        // 载入地图服务
        const myTiledMapServiceLayer = new ArcGISTiledMapServiceLayer ('http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetColor/MapServer');
        this.map.addLayer(myTiledMapServiceLayer);

        // dojo载入事件添加
        dojo.connect(this.map, 'onLoad', (evt) => {
        // 点标记
        const newPoint = new Point(12709568.097279584, 3581250.359213206, new SpatialReference({ wkid: 102100 }));
        const picSymbol = new PictureMarkerSymbol('http://www.easyicon.net/api/resizeApi.php?id=1185658&size=32', 25, 32);
        const graphic = new Graphic(newPoint, picSymbol);
        // js通过add方法添加但typescript无效,
        // ##原因：不能直接写在地图加载的后面，只能在dojo载入事件里写入,也就是这里
        this.map.graphics.add(graphic);
        });

        // dojo点击事件添加
        dojo.connect(this.map, 'onClick', (evt) => {
          const emp = evt.mapPoint;
          const cur_wkid = emp.spatialReference.wkid; // 当前坐标系
          console.log('当前地图的坐标系为:wkid==>' + cur_wkid);
          console.log('刚才点击的墨卡托为:x==>' + emp.x + '  y==>' + emp.y);
        });
      });
    });
  }


  // 坐标换算方法
}
