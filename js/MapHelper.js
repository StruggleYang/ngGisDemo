define([
    "dojo/_base/declare",
    "esri/toolbars/draw"
], function (
    declare,
    Draw
) {
    //地球半径
    var EARTH_RADIUS = 6378.137;
    return declare("el.Tool.MapHelper", null,
    {
        constructor: function (options) {
            dojo.mixin(this, options);
        },
        //墨卡托坐标系转经纬度坐标系
        Mercator2LonLat: function (geometry) {
            if (geometry.spatialReference.wkid != 102113 && geometry.spatialReference.wkid != 102100) return geometry;
            var spatialReference = new esri.SpatialReference(4326);
            switch (geometry.type) {
                case "polygon":
                    var polygon = new esri.geometry.Polygon(spatialReference);
                    var rings = geometry.rings;
                    for (var i = 0; i < rings.length; i++) {
                        var newRing = new Array();
                        for (var j = 0; j < rings[i].length; j++) {
                            newRing.push(PointMercator2LonLat(rings[i][j]));
                        }
                        polygon.addRing(newRing);
                    }
                    return polygon;
                case "polyline":
                    var polyline = new esri.geometry.Polyline(spatialReference);
                    var paths = geometry.paths;
                    for (var i = 0; i < paths.length; i++) {
                        var newPath = new Array();
                        for (var j = 0; j < paths[i].length; j++) {
                            newPath.push(PointMercator2LonLat(paths[i][j]));
                        }
                        polyline.addPath(newPath);
                    }
                    return polyline;
                case "point":
                    var newPoint = PointMercator2LonLat([geometry.x, geometry.y]);
                    var point = new esri.geometry.Point(newPoint[0], newPoint[1], spatialReference);
                    return point;
            }
        },
        //经纬度坐标系转墨卡托坐标系
        LonLat2Mercator:function(geometry){
            if (geometry.spatialReference.wkid != 4326) return geometry;
            var spatialReference = new esri.SpatialReference(102100);
            switch (geometry.type) {
                case "polygon":
                    var polygon = new esri.geometry.Polygon(spatialReference);
                    var rings = geometry.rings;
                    for (var i = 0; i < rings.length; i++) {
                        var newRing = new Array();
                        for (var j = 0; j < rings[i].length; j++) {
                            newRing.push(PointLonLat2Mercator(rings[i][j]));
                        }
                        polygon.addRing(newRing);
                    }
                    return polygon;
                case "polyline":
                    var polyline = new esri.geometry.Polyline(spatialReference);
                    var paths = geometry.paths;
                    for (var i = 0; i < paths.length; i++) {
                        var newPath = new Array();
                        for (var j = 0; j < paths[i].length; j++) {
                            newPath.push(PointLonLat2Mercator(paths[i][j]));
                        }
                        polyline.addPath(newPath);
                    }
                    return polyline;
                case "point":
                    var newPoint = PointLonLat2Mercator([geometry.x, geometry.y]);
                    var point = new esri.geometry.Point(newPoint[0], newPoint[1], spatialReference);
                    return point;
            }
        },
        //绘制图形
        DrawGeometry: function (mode, callback, allowStopDrawing) {
            this.Map.disableMapNavigation();

            this.DrawObj = new Draw(this.Map);
            this.DrawObj.on("draw-end", function (e) {
                if (callback != null) callback(e);
                if (allowStopDrawing) {
                    this.deactivate();
                    this.Map.enableMapNavigation();
                }
            });
            this.DrawObj.activate(mode);
        },
        //结束绘制
        DrawEnd: function () {
            if (this.DrawObj != null) this.DrawObj.deactivate();
            this.Map.enableMapNavigation();
        },
        //计算长度
        CalculateLength: function (points, spatialReference) {
            if (points == null || points.length == 0) return 0;
            var result = { total: 0, segments: new Array(points.length - 1) };
            points = ConvertToLonLat(points, spatialReference.wkid);
            for (var i = 0; i < points.length - 1; i++) {
                var distance = Math.abs(CalDistanceBetweenTwoPoints(points[i], points[i + 1]));
                result.segments[i] = distance;
                result.total += distance;
            }
            return result;
        },
        //计算面积(坐标系需为墨卡托坐标系：102113、102100)
        CalculateAreaAndLength: function (points, spatialReference) {
            if (points == null || points.length == 0) return 0;
            var rings = SimplifyPolygon(points);
            var result = { area: 0, length: 0 };
            for (var i = 0; i < rings.length; i++) {
                var ring = ConvertToLonLat(rings[i], spatialReference.wkid);
                ring[rings[i].length] = ring[0];
                result.length += Math.abs(CalSimpleLength(ring));
                result.area += Math.abs(CalSimpleArea(ring));
            }
            return result;
        }
    });
    //转坐标系为经纬度坐标系
    function ConvertToLonLat(points, wkid) {
        switch (wkid) {
            case 102113:
            case 102100:
                for (var i = 0; i < points.length; i++) {
                    points[i] = PointMercator2LonLat(points[i]);
                }
                break;
        }
        return points;
    }
    //转坐标系为墨卡托坐标系
    function ConvertToMercator(points, wkid) {
        switch (wkid) {
            case 4326:
                for (var i = 0; i < points.length; i++) {
                    points[i] = PointMercator2LonLat(points[i]);
                }
                break;
        }
        return points;
    }
    //墨卡托坐标系转经纬度坐标系
    function PointMercator2LonLat(point) {
        return [
            point[0] / 20037508.34 * 180,
            180 / Math.PI * (2 * Math.atan(Math.exp(point[1] / 20037508.34 * 180 * Math.PI / 180)) - Math.PI / 2)
        ];
    }
    //经纬度坐标系转墨卡托坐标系
    function PointLonLat2Mercator(point) {
        return [
            point[0] * 20037508.34 / 180,
            (Math.log(Math.tan((90 + point[1]) * Math.PI / 360)) / (Math.PI / 180)) * 20037508.34 / 180
        ];
    }
    //计算两点间距离
    function CalDistanceBetweenTwoPoints(startPoint, endPoint) {
        var x1 = Rad(startPoint[0]);
        var y1 = Rad(startPoint[1]);
        var x2 = Rad(endPoint[0]);
        var y2 = Rad(endPoint[1]);
        return Math.acos(Math.sin(y1) * Math.sin(y2) + Math.cos(y1) * Math.cos(y2) * Math.cos(x2 - x1)) * EARTH_RADIUS;
    }
    //实数转角度
    function Rad(value) {
        return value * Math.PI / 180.0;
    }
    //简化面图形(传入的点需要转成墨卡托坐标系)
    function SimplifyPolygon(points) {
        var array = new Array(points.length - 1);
        for (var i = 0; i < points.length - 1; i++) {
            //array[i] = { X: Math.round(points[i][0]), Y: Math.round(points[i][1]) };
            array[i] = { X: points[i][0], Y: points[i][1] };
        }
        var simplifyPolygon = ClipperLib.Clipper.SimplifyPolygon(array, ClipperLib.PolyFillType.pftEvenOdd);
        var result = new Array(simplifyPolygon.length);
        for (var i = 0; i < simplifyPolygon.length; i++) {
            var ring = new Array(simplifyPolygon[i].length);
            for (var j = 0; j < simplifyPolygon[i].length; j++) {
                ring[j] = [simplifyPolygon[i][j].X, simplifyPolygon[i][j].Y];
            }
            result[i] = ring;
        }
        return result;
    }
    //计算简化面图形的周长
    function CalSimpleLength(points) {
        var result = 0;
        for (var i = 0; i < points.length - 1; i++) {
            result += CalDistanceBetweenTwoPoints(points[i], points[i + 1]);
        }
        return result;
    }
    //计算简化面图形的面积
    function CalSimpleArea(points) {
        var n = points.length;
        if (n < 3)
            return 0.0;
        var p0 = [0, 0];
        var p1 = points[0];
        var p2 = points[1];
        var x0 = p1[0] * 1.0;
        p2[0] -= x0;
        var sum = 0.0;
        for (var i = 1; i < n - 1; i++) {
            p0[1] = p1[1] * 1.0;
            p1[0] = p2[0] * 1.0;
            p1[1] = p2[1] * 1.0;
            p2 = [points[i + 1][0] * 1.0, points[i + 1][1] * 1.0];
            p2[0] -= x0;
            p0[0] = 0;
            //sum += p1.X * (p0.Y - p2.Y);
            //sum += (p1[0] < 0 ? -1 : 1) * ((p0[1] - p2[1]) < 0 ? -1 : 1) * CalDistanceBetweenTwoPoints([p1[0], p1[1]], [p1[0], 0]) * CalDistanceBetweenTwoPoints([0, p0[1]], [0, p2[1]]); sum += (p1.x > 0 ? 1 : -1) * CalDistanceBetweenTwoPoints(p1, { x: 0, y: p1.y }) * ((p0.y - p2.y) < 0 ? (-1) : 1) * CalDistanceBetweenTwoPoints(p0, { x: p0.x, y: p2.y });
            sum += (p1[0] > 0 ? 1 : -1) * CalDistanceBetweenTwoPoints(p1, [0, p1[1]]) * ((p0[1] - p2[1]) < 0 ? (-1) : 1) * CalDistanceBetweenTwoPoints(p0, [p0[0], p2[1]]);
        }
        return sum / 2.0;
    }
});
