import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { EsriLoaderService } from 'angular-esri-loader';
@Component({
  selector: 'app-esri-map',
  templateUrl: './esri-map.component.html',
  styleUrls: ['./esri-map.component.css']
})
export class EsriMapComponent implements OnInit {
  // 这里指向一个选择器map在esri-map.component.html中
  @ViewChild('map') mapEl: ElementRef;
  // 地图初始变量
  map: any;
  polylineJson: any = { // 标记线的json数据
    'paths': [[
        // 根据不同的地图坐标类型对应的坐标的值也会有变化
        // [114.19699095146629, 30.603538511761222],
    ]],
    'spatialReference': { 'wkid' : 102100}
};

points: any = [ // 模拟的点数组数据用于描线
    [12709568.097279584, 3581250.359213206],
    [12708134.9029992, 3580175.4635029174],
    [12707700.167400816, 3579950.9297323236],
    [12707012.234146232, 3579864.9380755005],
    [12706854.58277539, 3579812.3876185534],
    [12706668.26751894, 3579611.7404192993],
    [12706563.166605044, 3579415.8705343134],
    [12706243.086549092, 3579520.971448208],
    [12706362.519405792, 3579898.3792753764],
    [12706610.939747725, 3580036.9213891467],
    [12707461.30168742, 3580251.9005312044],
    [12707590.289172653, 3580294.896359616],
    [12708240.003913095, 3580667.526872516],
    [12708794.172368176, 3581188.2541277227],
    [12709424.777851546, 3581551.330012087],
    [12709553.76533678, 3581269.4684702777]
];
/*******************地图***************/

  constructor(private esriLoader: EsriLoaderService) { }

  ngOnInit() {
    this.loadMap();
  }

  loadMap() {
    // only load the ArcGIS API for JavaScript when this component is loaded
    return this.esriLoader.load({
      url: '//js.arcgis.com/3.17/'
      // url: 'http://192.168.0.222/arcgis_js_api/library/3.17/3.17/init.js' // 如果没有搭建gis函数则需使用在线的
    }).then(() => {
      // 模块载入要一一对应
      this.esriLoader.loadModules([
        'esri',
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
        esri, Map, ArcGISTiledMapServiceLayer, Draw,
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
          // basemap: 'osm' // 不用基础图层
        });
        // 载入地图服务
        const myTiledMapServiceLayer = new ArcGISTiledMapServiceLayer (
          'http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineCommunity_Mobile/MapServer' );
        this.map.addLayer(myTiledMapServiceLayer);

        // dojo载入事件添加
        dojo.connect(this.map, 'onLoad', (evt) => {
          // 点标记
          const newPoint = new Point(12709568.097279584, 3581250.359213206, new SpatialReference({ wkid: 102100 }));
          const picSymbol = new PictureMarkerSymbol('http://www.easyicon.net/api/resizeApi.php?id=1185658&size=32', 25, 32);
          const graphic = new Graphic(newPoint, picSymbol);
          this.map.graphics.add(graphic);

          // 加入测试点数据
          for (let i = 0; i < this.points.length; i++) {
              this.polylineJson.paths[0].push([ this.points[i][0], this.points[i][1] ]);
          }
          const polyline = new Polyline(this.polylineJson);
          // 线样式DASH虚线SOLID实线
          const sys = new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH, new esri.Color([16, 142, 233]), 3);
          const graphic2 = new Graphic(polyline, sys);
          this.map.graphics.add(graphic2); // 添加曲线
        });

        // dojo点击事件添加
        dojo.connect(this.map, 'onClick', (evt) => {
          const emp = evt.mapPoint;
          const cur_wkid = emp.spatialReference.wkid; // 当前坐标系
          console.log('当前地图的坐标系为:wkid==>' + cur_wkid);
          console.log('刚才点击的墨卡托为:x==>' + emp.x + '  y==>' + emp.y);
          // 点击添加一个点
          const newPoint = new Point(emp.x, emp.y, new SpatialReference({ wkid: 102100 }));
          const picSymbol = new PictureMarkerSymbol('http://www.easyicon.net/api/resizeApi.php?id=1185658&size=32', 25, 32);
          const graphic = new Graphic(newPoint, picSymbol);
          this.map.graphics.add(graphic);
        });
      });
    });
  }
}
