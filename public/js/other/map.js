if (typeof BMap != "undefined") {
    this.map = new BMap.Map(this.params.id); // 创建百度地图并实例化
    var poi = new BMap.Point(this.params.lng, this.params.lat); // 创建坐标点
    this.map.centerAndZoom(poi, this.params.zoom); // 初始化
    /*允许鼠标滚动，放大缩小，不调用这个方法，默认不允许放大缩小*/
    if (this.params.enableZoom) {
        this.map.enableScrollWheelZoom();
    }
}else{
    console.log(this.params.id);
    this.createMap();
}