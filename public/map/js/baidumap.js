/**
 * Created by www.xxmi.org on 2016/8/25.
 * 描述：对百度地图一些功能的封装
 * dependencies：
 * jquery
 *
 * 百度地图 API :
 *      <script src="http://api.map.baidu.com/api?v=2.0&ak=Zvt09wAOQcdH95F8I9hwQZ6sniTwzGOw" type="text/javascript"></script>
 * 鼠标绘制工具 :
 *      <script type="text/javascript" src="http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.js"></script>
 *      <link rel="stylesheet" href="http://api.map.baidu.com/library/DrawingManager/1.4/src/DrawingManager_min.css" />
 *
 * 检索信息窗口 ：
 *      <script type="text/javascript" src="http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.js"></script>
 *      <link rel="stylesheet" href="http://api.map.baidu.com/library/SearchInfoWindow/1.4/src/SearchInfoWindow_min.css" />
 *
 * 几何工具 ：
 *      <script src="js/common/geoutils.js"></script>
 */
var Map = window.Map = Map || {};
(function () {
    /**
     * 默认配置
     * @type {{}}
     */
    var defaultConfig = {
        //api 版本
        version: 2.0,
        //访问应用 key
        ak: "Zvt09wAOQcdH95F8I9hwQZ6sniTwzGOw"
    };

    /**
     *地图默认设置
     */
    var defaults = {
        id : "baiduMapContent", // 百度地图容器
        lng : 106.529857, // 初始化点,X，经度
        lat : 29.586325, // Y，纬度
        zoom : 12, // 初始化级别
        enableZoom: true,   //鼠标滚动放大缩小地图
        imgUrl : "", // 图片路径
        data : {pointType:"gps",data:[]}, 		// 数据
        auto: true,	//true，自动创建地图，false，手动创建地图，调用 launch()
        styleOptions : { // 绘画的样式
            strokeColor : "#4E98DD", // 边线颜色。
            fillColor : "#4E98DD", // 填充颜色。当参数为空时，圆形将没有填充效果。
            strokeWeight : 5, // 边线的宽度，以像素为单位。
            strokeOpacity : 1, // 边线透明度，取值范围0 - 1。
            fillOpacity : 1, // 填充的透明度，取值范围0 - 1。
            strokeStyle : 'solid'// 边线的样式，solid或dashed
        },
        polylineOptions : { // 绘画线的样式
            strokeColor : "blue", // 颜色
            strokeWeight : 3, // 线的粗细度
            strokeOpacity : 1		// 透明度
        },
        //思路：
        //1.当点击车辆列表中的某一个车辆时，获取当前系统时间为开始时间。
        //2.不管点击的这个车辆是否为当前监控的车辆，都清除掉在地图上的信息（坐标点，连接线）
        //3.获取数据后，显示到地图上，并把返回的坐标点连接成一条线。如果之前有点和线追加
        //	每个坐标点的上有一个小图标
        //4.刷新时间设定，每隔 60 秒（刷新频率） 刷新一次。
        //	（刷新时，以当前系统时间为开始时间,并更新 startTime ）
        //5. 实时信息（默认打开最后一个点的信息）
        //6.每次刷新请求返回的数据都 push 到 dataPoint 中
        //7.返回数据格式：dataPoint:[{vin:"xxxx"},{vin:"xxxx"}]
        monitoring:{
            //1.如果自动刷新停止以后，在点击开始，这时考虑 startTime 和当前时间差是否大于时间间隔，
            //大于则立即刷新,否则在设置的间隔时间以后才刷新
            //2.点击停止，立即清除 timerTimeout(定时刷新)，timerInterval（倒计时）
            //	初始化 inverse=(30)interval
            //3.当自动刷新为开启状态时，点击手动刷新，
            //	立即清除 timerTimeout(定时刷新)，timerInterval（倒计时）初始化 inverse=(30)interval
            //	并从新开启自动刷新
            enable:true,	//自动刷新，true：（默认）开启，false：关闭
            interval: 30,		//间隔,以秒为单位
            timerTimeout: null,	//存放自动刷新的定时器
            inverse:30,	//到计时,用：window.setInterval
            timerInterval: null, //存放计时器,1 秒执行一次回调函数，并传递当前的 inverse 30 29 28 27 ---...
            timerIntervalCallback:null,  //倒计时回调，每隔 1 秒调用一次
            rtmRequest:null, //监控请求
            randomColor:true, //随机颜色
            infoWindowCallback: null    //点击标点，弹窗的回调函数
        }
    }


    var preMsg = "Map.Baidu ...";

    /**
     * 百度地图
     * @type {Window.Map.Baidu}
     */
    var Baidu = Map.Baidu = function (p_params) {
        var $this = this;
        this.map = null;
        this.baiduMap = {
            initMainApi:false
        };
        this.params = null; //参数设置
        /**
         * 实时监控,可以同时监控多个车
         */
        this.monitoring = [];
        this.init(p_params);
    }

    /**
     * 初始化
     * @param p_params 参数设置
     */
    Baidu.prototype.init = function (p_params) {
        var _class = Utils.ObjectUtils.getClass(p_params);
        if(_class != "Object"){
            console.error(preMsg+"参数必须是 Object 类型。");
            return;
        }
        //合并
        this.params = $.extend(true, Utils.ObjectUtils.deepClone(defaults), p_params);
        //实例化则启动
        if(this.params.auto) {
            this.launch();
        }
    }

    /**
     * 启动
     */
    Baidu.prototype.launch = function () {
        initBMapApi();
        this.createMap();
    }

    /**
     * 创建百度地图并实例化
     */
    Baidu.prototype.createMap = function () {
        if(this.map == null){
            window.setTimeout(function () {
                if (typeof BMap != "undefined") {
                    this.map = new BMap.Map(this.params.id); //创建百度地图并实例化
                    var poi = new BMap.Point(this.params.lng, this.params.lat); // 创建坐标点
                    this.map.centerAndZoom(poi, this.params.zoom); // 初始化
                    /*允许鼠标滚动，放大缩小，不调用这个方法，默认不允许放大缩小*/
                    if (this.params.enableZoom) {
                        this.map.enableScrollWheelZoom();
                    }
                }else{
                    this.createMap();
                }
            }.bind(this),100);
        }
    }

    /**
     *开始监控
     * @param vin<String|Array> 车辆,车架号
     * @param callback(error,msg) 回调函数
     */
    Baidu.prototype.startMonitoring = function (vin,callback) {
        var vin_class = Utils.ObjectUtils.getClass(vin);
        if(vin_class != "String" && vin_class != "Array"){
            var error = new Error("vin : 必须传递车辆车架号，并且是字符串。");
            var msg = "没有传递车架号";
            if(Utils.ObjectUtils.getClass(callback) == "Function"){
                callback(error,msg);
            }
            console.error(error);
            console.error(msg);
            return;
        }
        //每次执行这个方法都清除该车对应的监控信息
        this.clearMonitoringByCarVin(vin);

        return;

        //请求回调函数
        if(typeof this.params.monitoring.rtmRequest == "undefined" ||
            !(this.params.monitoring.rtmRequest instanceof Function)){
            console.error(preMsg+" 请设置,实时监控请求回调函数！");
            return;
        }
        //监控请求数据
        this.params.monitoring.rtmRequest(function (err,data) {
            
        });
    }

    var mdmsg = "setMonitoringData 请传递监控数据！格式：Object|Array(Object...)";
    /**
     * 设置实时监控的数据
     * @param monitoringData  1|n 车的数据
     */
    Baidu.prototype.setMonitoringData = function (monitoringData) {
        var _class = Utils.ObjectUtils.getClass(monitoringData);
        if(_class == "Undefined" || (_class != "Object" && _class != "Array")){
            console.error(preMsg+mdmsg);
            return;
        }

        //单个
        if(_class == "Object"){
            this.monitoringDataHandler(monitoringData,"single");
        }//多个
        else{
            for(var i in monitoringData){
                this.monitoringDataHandler(monitoringData[i],"more");
            }
            //把所有点连接到一起，设置最佳视野
            var ms = [];
            for(var i in this.monitoring){
                ms = ms.concat(this.monitoring[i].dataPoint);
            }
            this.setViewport(this.assemblePoints(ms));
        }
    }

    /**
     * 监控数据处理
     * @param dataObject 监控数据
     * 格式：
     *      {
     *          startTime: "2016-08-25 11:11:11", //开始时间。查询时（开始时间 - 结束时间）
     *          car:{//返回的数据格式（）
     *               vin: "XSFWU2424423DWE",	//车架号
     *               carName: "长江七号"        //车名
     *          },
     *          dataPoint:[ //存放返回来的数据点
     *               {   lng:123.254342, //经度
     *                   lat:23.10923,   //纬度
     *                   location: "重庆澄溪",   //位置
     *                   speed:"20km/h",     //速度
     *                   electricity: "2A"   //电流
     *               }
     *           ]
     *       }
     * @param sign<String> 标记,single|more
     */
    Baidu.prototype.monitoringDataHandler = function (dataObject,sign) {
        var obj =  Utils.ObjectUtils.deepClone(dataObject);
        var monitoring = this.getMonitoringByCarVin(obj.car.vin);
        if(monitoring == null){
            monitoring = obj;
            monitoring.startTime = Utils.DateUtils.getNowDateTime();
            monitoring.polyline = null; //线对象
            monitoring.startMarker = null;   //开始标点，第一个点
            monitoring.endMarker = null;     //结束标点，最后一个点（每当追加数据的时候，都必须在地图上清除该点）
            monitoring.middleMarkers = new Array(); //存放，除了【开始，结束】标点以外的标点，中间点
            if(this.params.monitoring.randomColor){
                monitoring.color = Utils.WebUtils.getRandomColor();
            }else{
                monitoring.color = this.params.polylineOptions.color;
            }
            this.monitoring.push(monitoring);
        }else{
            monitoring.startTime = Utils.DateUtils.getNowDateTime();
            //把坐标点添加到
            for(var i in obj.dataPoint){
                monitoring.dataPoint.push(obj.dataPoint[i]);
            }
        }
        //添加线
        if(monitoring.polyline == null){
            monitoring.polyline = this.addPolyline(obj.dataPoint,monitoring.color);
        }else{
            monitoring.polyline.setPath(this.assemblePoints(monitoring.dataPoint));
        }
        //设置中心点,最佳视野
        if(monitoring.dataPoint.length > 0){
            if(sign == "single"){   //只有是一辆车的时候，才设置最佳视野，多辆车不明确方向
                this.setViewport(monitoring.dataPoint);
            }
        }
        //没有任何点数据
        if(obj.dataPoint.length <= 0){
            return;
        }
        var length = monitoring.dataPoint.length;
        //1 个点,显示车
        if(length >= 1){
            //添加，开始标点
            if(monitoring.startMarker != null){
                this.map.removeOverlay(monitoring.startMarker);
                monitoring.startMarker = null;
            }
            var startUrl = length == 1 ? "/images/car.png":"/images/start.png";
            //添加，开始标点
            monitoring.startMarker = this.addMarker({
                car:monitoring.car,
                lng:monitoring.dataPoint[0].lng,
                lat:monitoring.dataPoint[0].lat,
                icon:{url:startUrl,size:{width:27,height:32}}},
                {title:monitoring.car.carName, offset:{left:-10,top:-18}},
                "信息窗口",this.params.monitoring.infoWindowCallback);
            if(length <= 1) {
                return;
            }

            //添加，结束标点（当前车的最新位置）
            if(monitoring.endMarker != null){
                this.map.removeOverlay(monitoring.endMarker);
            }
            //结束点永远都是最后一个点
            monitoring.endMarker = this.addMarker({
                car:monitoring.car,
                lng:monitoring.dataPoint[monitoring.dataPoint.length-1].lng,
                lat:monitoring.dataPoint[monitoring.dataPoint.length-1].lat,
                icon:{url:"/images/car.png",size:{width:35,height:36}}
            },{title:monitoring.car.carName, offset:{left:-10,top:-18}},null,this.params.monitoring.infoWindowCallback);

            //从第二点+已经添加了的中间点
            var i = 1+monitoring.middleMarkers.length;
            var max = monitoring.dataPoint.length-1;
            //添加中间点
            for(i;i<max;i++){
                monitoring.middleMarkers.push(this.addMarker({
                    car:monitoring.car,
                    lng:monitoring.dataPoint[i].lng,
                    lat:monitoring.dataPoint[i].lat,
                    icon:{url:"/images/point.png",size:{width:14,height:14}}
                },null,null,this.params.monitoring.infoWindowCallback));
            }
        }
    }

    /**
     * 根据车辆车架号获取监控信息
     * @param vin 车架号
     * @returns {*}
     */
    Baidu.prototype.getMonitoringByCarVin = function (vin) {
        var monitoring = null;
        if(this.monitoring.length <= 0 ){
            return monitoring;
        }
        for(var i=0; i<this.monitoring.length;i++){
            if(vin == this.monitoring[i].car.vin){
                monitoring = this.monitoring[i];
                break;
            }
        }
        return monitoring;
    }

    /**
     * 清除实时监控信息,根据车辆车架号
     * @param vins<String|Array> 车架号
     */
    Baidu.prototype.clearMonitoringByCarVin = function (vins) {
        var vin = null;
        if(Utils.ObjectUtils.getClass(vins) == "String" ){
            vin = new Array();
            vin.push(vins);
        }else{
            vin = vins;
        }
        if(this.monitoring.length > 0 ){
            for(var g in vin){
                for(var i in this.monitoring){
                    if(vin[g] == this.monitoring[i].car.vin){
                        this.map.removeOverlay(this.monitoring[i].polyline);    //画的线
                        this.monitoring[i].polyline = null;
                        this.map.removeOverlay(this.monitoring[i].startMarker); //开始点
                        this.monitoring[i].startMarker = null;
                        this.map.removeOverlay(this.monitoring[i].endMarker); //结束点
                        this.monitoring[i].endMarker = null;
                        for(var k in this.monitoring[i].middleMarkers){ //中间点
                            this.map.removeOverlay(this.monitoring[i].middleMarkers[k]);
                            this.monitoring[i].middleMarkers[k] = null;
                        }
                        this.monitoring.splice(i,1);    //删除制定
                        break;
                    }
                }
            }
        }
    }


    /**
     * 划线
     * @param points Array<{lng:123.123,lat:23.23}>
     */
    Baidu.prototype.addPolyline = function (points,color) {
        var polyline = new BMap.Polyline(this.assemblePoints(points),this.params.polylineOptions);
        if(Utils.ObjectUtils.getClass(color) != "Undefined"){
            polyline.setStrokeColor(color);
        }
        this.map.addOverlay(polyline);
        return polyline;
    }

    /**
     * 组装数据点
     * @param points [{lng:123.123,lat:23.23}...]
     * @returns {Array<BMap.Point>}
     */
    Baidu.prototype.assemblePoints = function (points) {
        var ps = new Array();
        for(var i in points){
            ps.push(new BMap.Point(points[i].lng,points[i].lat));
        }
        return ps;
    }

    //默认标点信息
    var defaultMarkerInfo={
            car:{vin:""},
            lng:123.23,lat:23.23,offSet:{left:0,top:0},
            icon:{url:"/images/start.png", size:{width:27,height:32}}
    };
    /**
     * 添加标点
     * @param markerInfo 标点信息
     * @param labelInfo 标注信息
     * @param infoWindow 信息窗
     * @param infoCallback 弹出窗信息的回调函数(优先级比 info 高)
     * @returns {BMap.Marker}
     */
    Baidu.prototype.addMarker = function (markerInfo,labelInfo,infoWindow,infoWindowCallback) {
        var mkInfo = $.extend(true,Utils.ObjectUtils.deepClone(defaultMarkerInfo),markerInfo);
        var point = new BMap.Point(mkInfo.lng,mkInfo.lat);  //点
        var myIcon = new BMap.Icon(mkInfo.icon.url,new BMap.Size(mkInfo.icon.size.width, mkInfo.icon.size.height));//图标
        var marker = new BMap.Marker(point);    //标点
        marker.setIcon(myIcon);
        marker.setOffset(new BMap.Size(mkInfo.offSet.left,mkInfo.offSet.top));    //标点偏移
        this.map.addOverlay(marker);
        //标注
        if(null != labelInfo){
           marker.setLabel(this.addLabel(labelInfo));
        }
        this.infoWindow(marker,mkInfo.car,infoWindow,infoWindowCallback);
        return marker;
    }

    /**
     * 添加标注
     * @param labelInfo
     * @returns {BMap.Label}
     */
    Baidu.prototype.addLabel = function (labelInfo) {
        var info = {
            title:"",
            offset:{left:0,top:0},
            style:{}
        }
        //字符串,直接设置文本标注
        if(typeof labelInfo  == "string"){
            info.title = labelInfo;
        }else{
            info = $.extend(true,info,labelInfo);
        }
        var label =  new BMap.Label(info.title, {
            offset : new BMap.Size(info.offset.left, info.offset.top) //设置标注的偏移值。
        });
        label.setStyle(info.style);
        return label;
    }

    /**
     * 点击标点，弹出信息窗
     * @param marker<BMap.Marker> 标点
     * @param carInfo<Object> 车辆信息，必须要有 vin
     * @param infoWindow<String> 信息窗 html
     * @param infoWindowCallback<Function> 回调函数
     */
    Baidu.prototype.infoWindow = function (marker,carInfo,infoWindow,infoWindowCallback) {
        if(null == infoWindow  && !(infoWindowCallback instanceof Function)){
            return;
        }
        var bmapInfoWindow = new BMap.InfoWindow(""); // 创建信息窗口对象
        bmapInfoWindow.setWidth(500);
        bmapInfoWindow.setHeight(183);
        bmapInfoWindow.addEventListener("open", function(){

        });
        // 添加标注事件
        marker.addEventListener("click", function() {
            if(infoWindowCallback instanceof Function){
                infoWindowCallback(carInfo,function (error,html) {
                    // bmapInfoWindow.setTitle(html);
                    if(!error){
                        bmapInfoWindow.setContent(html);
                        marker.openInfoWindow(bmapInfoWindow,this.map); // 打开信息窗口,并在标点的地方显示信息窗口
                    }
                }.bind(this));
            }else if(null != infoWindow){
                bmapInfoWindow.setContent(infoWindow);
                marker.openInfoWindow(bmapInfoWindow,this.map); // 打开信息窗口,并在标点的地方显示信息窗口
            }
        }.bind(this));
    }




    /**
     * 移动到中心点
     * @param lng 经度
     * @param lat 纬度
     */
    Baidu.prototype.panTo = function(lng,lat){
//		this.map.panTo(new BMap.Point(lng,lat));	//中心点移动，这个不行
        this.map.setCenter(new BMap.Point(lng,lat));	 //这个效果好
    }


    /**
     * 最佳视野
     * @param points Array<BMap.Point()>
     */
    Baidu.prototype.setViewport = function (points) {
        this.map.setViewport(this.assemblePoints(points));
    }





    /**
     * 初始化百度的API
     */
    function initBMapApi() {
        if($("script[id=mainCMapApi]").length <= 0 ){
            document.write('<script id="mainCMapApi" src="http://api.map.baidu.com/api?v='+defaultConfig.version+'&ak='+defaultConfig.ak+'" type="text/javascript"></script>')
        }
    }
})();

