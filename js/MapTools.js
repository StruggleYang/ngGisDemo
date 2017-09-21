(function () {
var MapTools = {

    //墨卡托投影（102100）与经纬度（4623）互转
    /**
     * 经纬度转墨卡托
     * 
     * @param {}
     * object 传入：{con:xxxx,lat:xxxx}
     * 
     */
    convertWGS84ToMercator : function(object) {
        var con = object.con;
        var lat = object.lat;
        var merX = con * 20037508.34 / 180;
        var merY = Math.log(Math.tan((90 + lat) * Math.PI / 360)) / (Math.PI / 180);
        merY = merY * 20037508.34 / 180;
        return {
            x : merX,
            y : merY
        }
    },

    /**
     * 墨卡托转经纬度
     * 
     * @param {}
     * object 传入：{merX:xxxx,merY:xxxx}
     */
    convertMercatorToWGS84 : function(object) {

        var merX = object.merX;
        var merY = object.merY;
        var con = merX / 20037508.34 * 180;
        var lat = merY / 20037508.34 * 180;
        lat = 180 / Math.PI
                * (2 * Math.atan(Math.exp(lat * Math.PI / 180)) - Math.PI / 2);
        return {
            con : con,
            lat : lat
        }
    }
}
window.MapTools = MapTools;
}());
