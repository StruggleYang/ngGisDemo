$(document).ready(function(){ 
    init_max_map(); // 初始化地图
    tests();
})
var logs = function(str){
   console.log(str)
}
var infos = function(str){
    console.info("========================"+str+"=======================")
}

var tests = function(){
   // 转换为墨卡托
   var pt = {
    con :114.19684073186703,
    lat :30.603815540194695
   }
   logs("原始"+pt.con+","+pt.lat+"======>"+MapTools.convertWGS84ToMercator(pt).x+","+MapTools.convertWGS84ToMercator(pt).y); 
   // 转换为经纬度
   var pt2 = {
    merX :12709353.116368584,
    merY :3580610.198602943
   }
   logs(MapTools.convertMercatorToWGS84(pt2)); 
}

// 初始化地图start
function init_max_map(){

   //定义地图对象 
   var map,graphic,moving,polylineJson,polylineJson2,points; 
   var startNum,endNum,isStop=false;
   //定义点点数组用于描线
   polylineJson={ 
    "paths": [[
        // [114.19699095146629, 30.603538511761222], 
        // [114.1922702635993, 30.59262280911043], 
        // [114.20123957054658, 30.587598586894675]
   ]],
     "spatialReference":{"wkid":102100}
 };  
 // 打点描线
 polylineJson2={ 
    "paths": [[
        // [114.19699095146629, 30.603538511761222], 
        // [114.1922702635993, 30.59262280911043], 
        // [114.20123957054658, 30.587598586894675]
   ]],
     "spatialReference":{"wkid":102100}
 };
   require([  
     "esri/map", 
     "esri/toolbars/draw",  
     "esri/symbols/SimpleMarkerSymbol", 
     "esri/symbols/SimpleLineSymbol",
     "esri/symbols/PictureMarkerSymbol",
     "esri/geometry/Point",
     "esri/geometry/Polyline",
     "esri/geometry/Extent",
     "esri/layers/GraphicsLayer",  
     "esri/symbols/PictureFillSymbol",
      "esri/symbols/CartographicLineSymbol", 
      "esri/SpatialReference",
      "esri/InfoTemplate",  
     "esri/graphic",   
     "dojo/_base/Color", "dojo/dom", "dojo/on", "dojo/domReady!"  
   ], function(  
     Map, Draw,  
     SimpleMarkerSymbol, SimpleLineSymbol,
     PictureMarkerSymbol,Point,Polyline,
     Extent,GraphicsLayer,  
     PictureFillSymbol, CartographicLineSymbol, 
     SpatialReference,InfoTemplate,  
     Graphic,Color, dom, on  
   ) {  
    // 用已有的dom id绑定地图
   map = new Map("mapView",{
       // 原始数据12709353.116368584,3580610.198602943
     center: [114.1700615729523,30.597683710794332], // 地图初始中心点
     zoom: 15, // 缩放比例
     logo:false, // 隐藏logo
     slider:false // 隐藏侧边缩放工具
   });  
   
   // 添加事件
  //dojo.connect(map,"onClick",getXY);
   dojo.connect(map,"onClick",showCoordinatesAndAddPoint);
    dojo.connect(map, "onLoad", graphicLoad);  

     // 改成对应的地图服务 此处为缓存地图服务
    var myTiledMapServiceLayer = new esri.layers.ArcGISTiledMapServiceLayer("http://cache1.arcgisonline.cn/arcgis/rest/services/ChinaOnlineStreetColor/MapServer");
   map.addLayer(myTiledMapServiceLayer);
   console.log(map)
   /* 获取点击的坐标点 */
   function getXY (evt){
       var emp = evt.mapPoint;
       var cur_wkid = emp.spatialReference.wkid; // 当前坐标系
       var obj2;
       console.log("当前地图的坐标系为:wkid==>"+cur_wkid);
       console.log("刚才点击的墨卡托为:x==>"+emp.x+"  y==>"+emp.y);
       /* 判断是否为摩克托投影坐标 */
       if(cur_wkid==102100){
           var obj = {
                   'merX':emp.x,
                   'merY':emp.y
           }
           /* 转换为经纬度 */
           // 如果需要转换为114.19684073186703,30.603815540194695
           obj2 = MapTools.convertMercatorToWGS84(obj);
           
           console.log("刚才点击的坐标为:con==>"+obj2.con+"  lat==>"+obj2.lat);
       }else{
           console.log("刚才点击的坐标为:x==>"+emp.x+"  y==>"+emp.y);
       }
   }


   /**
    * 点击时加入一个坐标点数据并且标记至地图图层
    * @param {*} evt 
    */
   function showCoordinatesAndAddPoint (evt) {  
    //get mapPoint from event  
        var mp = evt.mapPoint; // 可以从mp对象的属性中查找到图层对应的wkid的值，这个值和下面红色注释的值要保持一致  
        var cur_wkid = mp.spatialReference.wkid; // 当前坐标系
    // 坐标应该是进行转换了，和平常的经纬度有差别
        console.log("当前地图坐标系为"+cur_wkid+":点击的坐标为"+mp.x+"====="+mp.y);
        // 102100  
        var newPoint = new Point(mp.x, mp.y, new SpatialReference({ wkid: 102100 }));  
          console.log(map.graphics);
        var picSymbol = new PictureMarkerSymbol("img/map_marker.png", 25, 32);  
        var picGraphic = new Graphic(newPoint, picSymbol);  
        map.graphics.add(picGraphic);   
        console.log(map.graphics);
          // 点击一次添加一个点数据并生成线
        polylineJson2.paths[0].push([newPoint.x,newPoint.y]);
        console.log(polylineJson2);
        var polyline=new Polyline(polylineJson2);
        // 线样式DASH虚线SOLID实线
        var sys=new SimpleLineSymbol(SimpleLineSymbol.STYLE_DASH,new esri.Color([255,3,3]),3);
        var graphic2=new Graphic(polyline,sys);
        map.graphics.add(graphic2); 
   } 
   /* 初始化线段 */
   function graphicLoad()  {  
    // 原始坐标
    var pt = {
        con :114.1700615729523,
        lat :30.597683710794332
    }
    // 格式化的坐标
    var format = MapTools.convertWGS84ToMercator(pt);
          new SpatialReference({ wkid: 102100 }) //这个参数必须加，而且wkid的值要和图层保持一致，否则显示不出来，这个值可以从服务中找到  
            var newPoint = new Point(format.x, format.y, new SpatialReference({ wkid: 102100 })); 
           var picSymbol = new PictureMarkerSymbol("img/map_marker.png", 25, 32);  
           var picGraphic = new Graphic(newPoint, picSymbol);  
           map.graphics.add(picGraphic);
           /* 点标记结束 */

           /* 变量声明 */
           var xx = format.x; // 起始位置
           var yy = format.y;
           /* 线标记开始 */
           polylineJson={ 
                   "paths": [[
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
                  ]],
                    "spatialReference":{"wkid":102100}
                };  
          
          var polyline=new Polyline(polylineJson);
          // 线样式DASH虚线SOLID实线
          var sys=new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID,new esri.Color([255,3,3]),3);
          var graphic2=new Graphic(polyline,sys);
          map.graphics.add(graphic2); 
          /* 线标记结束 */
          /* 起始位置点标记开始 */
       var newPoint = new Point(polylineJson.paths[0][0][0], polylineJson.paths[0][0][1], new SpatialReference({ wkid: 102100 })); 
        var picSymbol = new PictureMarkerSymbol("img/map_marker.png", 25, 32);  
       var graphic = new Graphic(newPoint, picSymbol);  
         map.graphics.add(graphic);
          /* 起始位置点标记结束 */
           /*转换坐标开始，判断是否为墨卡托坐标  */
               /* var curr_wkid = polylineJson.spatialReference.wkid;
               if(curr_wkid==102100){
                   for(var i = 0;i<polylineJson.paths[0].length;i++){
                       var obj={
                           'merX':polylineJson.paths[0][i][0],
                           'merY':polylineJson.paths[0][i][1]
                       }
                       polylineJson.paths[0][i][0]=(convertMercatorToWGS84(obj).x);
                       polylineJson.paths[0][i][1]=(convertMercatorToWGS84(obj).y);
                   }
                   console.log(polylineJson);
               } */
               
               /* 转换坐标end */
          /* 开始 */
           document.getElementById("openTool").onclick=function(){
               logs(typeof(moving));
                    if(typeof(moving)!="undefined"){
                       clearInterval(moving); //清除移动 
               }
               points = polylineJson.paths[0]; 
               graphic.geometry.x = points[0][0]; 
               graphic.geometry.y = points[0][1]; 
               map.graphics.redraw(); 
               move(0,1);
               document.getElementById("closeTool").disabled=false;
               document.getElementById("continueTool").disabled=true;
               document.getElementById("returnTool").disabled=true;
             };
             // 自定义的移动按钮
             $(".hf_but").click(function(){
                 logs(typeof(moving));
                 if(typeof(moving)!="undefined"){
                         clearInterval(moving); //清除移动 
                 }
                 points = polylineJson.paths[0]; 
                 graphic.geometry.x = points[0][0]; 
                 graphic.geometry.y = points[0][1]; 
                 map.graphics.redraw(); 
                 move(0,1);
                document.getElementById("closeTool").disabled=false;
                 document.getElementById("continueTool").disabled=true;
                 document.getElementById("returnTool").disabled=true;
             })
            /* 停止 */
             document.getElementById("closeTool").onclick = function () { 
                 clearInterval(moving); 
                 document.getElementById("continueTool").disabled=false;
                 document.getElementById("returnTool").disabled=false;
             }; 
            /* 停止 */
            /* 继续 */
             document.getElementById("continueTool").onclick = function () {
                 if(typeof(moving)!="undefined"){
                         clearInterval(moving); //清除移动 
                 }
                 move(startNum,endNum);
                 document.getElementById("returnTool").disabled=true;
             }; 
            /* 继续 */
            /* 返回 */
             document.getElementById("returnTool").onclick = function () { 
                 graphic.geometry.x = points[0][0]; 
                 graphic.geometry.y = points[0][1];
                 graphic.symbol.angle=0;
                 map.graphics.redraw();
                 document.getElementById("continueTool").disabled=true;
             }; 
             /* 返回 */
             /* 移动代码 */
             ///根据序列点坐标 进行移动 
                 function move(start,end){
                   var x1=points[start][0];
                   var y1=points[start][1];
                   var x2=points[end][0];
                   var y2=points[end][1];
                   
                   var obj  = MapTools.convertMercatorToWGS84({'merX':x1,'merY':y1});
                   var obj2 = MapTools.convertMercatorToWGS84({'merX':x2,'merY':y2});
                   x1 = obj.x;
                   y1 = obj.y;
                   x2 = obj2.x;
                   y2 = obj2.y; 
                   
                   var p=(y2-y1)/(x2-x1);//斜率
                   var v=0.01;//距离  距离越小 位置越精确
                   moving=setInterval(function(){
                       startNum=start; 
                       endNum=end;
                       if(endNum==points.length-1){
                           document.getElementById("closeTool").disabled=true;
                           document.getElementById("continueTool").disabled=true;
                           document.getElementById("returnTool").disabled=false;
                       }
                      //分别计算 x,y轴方向速度
                      if(Math.abs(p)==Number.POSITIVE_INFINITY){//无穷大
                        graphic.geometry.y+=v;
                      }
                      else{
                        if(x2<x1){
                            graphic.geometry.x-=(1/Math.sqrt(1+p*p))*v;
                            graphic.geometry.y-=(p / Math.sqrt(1 + p * p)) * v; 
                            //计算物体角度 
                            graphic.symbol.angle =CalulateXYAnagle(x1,y1,x2,y2); //// (Math.PI / 2 - Math.atan(p)) * 180 / Math.PI+180
                        }
                        else{
                            graphic.geometry.x+=(1/Math.sqrt(1+p*p))*v;
                            graphic.geometry.y+=(p / Math.sqrt(1 + p * p)) * v; 
                            //计算物体角度 
                            graphic.symbol.angle =CalulateXYAnagle(x1,y1,x2,y2); ////(Math.PI / 2 - Math.atan(p)) * 180 / Math.PI
                        }
                      }
                   //图层刷新 
                   map.graphics.redraw(); 
                   if (Math.abs(graphic.geometry.x - x2) <=0.01 && Math.abs(graphic.geometry.y - y2) <=0.01) {
                       clearInterval(moving); 
                       startNum=start++; 
                       endNum=end++; 
                       if (end < points.length) 
                           move(start, end); 
                     } 
                   }, 50);     
                }
             /* 移动代码end */
             /* ？？？ */
              function continueMove(){
                  
              }
       }
   });
}
/* 初始化地图end */

      /*  */
function CalulateXYAnagle(startx,starty,endx,endy){
   /* var obj  = convertMercatorToWGS84({'merX':startx,'merY':starty});
   var obj2 = convertMercatorToWGS84({'merX':endx,'merY':endy});
   console.log(obj);
   startx = obj.x;
   starty = obj.y;
   endx = obj2.x;
   endy = obj2.y; */
   var tan=Math.atan(Math.abs((endy-starty)/(endx-startx)))*180/Math.PI+90;
    if (endx > startx && endy > starty)  {  //第一象限
        return -tan+180;  
    }else if (endx > startx && endy < starty) {  //第二象限
        return tan;  
    }else if (endx < startx && endy > starty)  {  //第三象限
        return tan - 180;  
    }else{  
        return - tan;  
    }  
       
}  