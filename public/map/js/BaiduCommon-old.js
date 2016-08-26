function BDMap(opts) {
	var $self = this;
	$self.map = null;
	$self.markers = new Array();	//存放标点对象
	$self.drawings = new Array();	//存放绘画的矩形、多边形对象-鼠标绘制
	$self.boundarys = new Array();	//存放边界对象，多个行政区域
	$self.redrawings = new Array(); //存放重绘矩形、多边形对象-手动触发
	$self.drawingManager = null;	//绘画工具对象
	$self.odata = new Array();		//存放标点数据-原始数据，没有对其中的数据进行过操作
	$self.cdata = new Array();		//存放标点数据-对其中的数据进行过操作，如坐标转换等操作
	$self.drawingSign = 1;	//绘制标记，1：只绘制，2绘制并搜索
	//绘画【矩形-多边形】的点数据
	$self.drawingData = {
			name: "baidu",	//地图名称
			mode: "rectangle",		//绘画模式【rectangle : 矩形】、【polygon：多边形】
			area: 0,			//绘画的面积
			points: [],	//绘画【矩形-多边形】的点数据，矩形顺序 顺时针，多边形逆时针
			center:{lng:0,lat:0},	//绘制框的中心点
			location:{	//位置
				formatted_address:	"重庆市江北区建新北路8号",	//结构化地址信息
				business: "",	//商圈信息，如 ，观音桥
				addressComponent:{
					country:"中国",	//国家
					province:"重庆市",	//省名
					city:"重庆市",	//城市名
					district:"江北区",	//区县名
					street: "",		//街道名称
					street_number:"",	//街道门牌号
					adcode:"130982",	//行政区划代码
					country_code: "",	//国家代码
					direction:"",		//和当前坐标点的方向，当有门牌号的时候返回数据
					distance:"" //和当前坐标点的距离，当有门牌号的时候返回数据
				},
				sematic_description: "红鼎国际名苑B座附近45米"		//当前位置结合POI的语义化结果描述。
			}
	};
	//行政区域划分的数据
	$self.boundaryData = {
			name: "baidu",	//地图名称
			mode: "rectangle",		//绘画模式【rectangle : 矩形】、【polygon：多边形】
			area: 0,			//绘画的面积
			points: [],	//绘画【矩形-多边形】的点数据，矩形顺序 顺时针，多边形逆时针
			center:{lng:0,lat:0},	//绘制框的中心点
			location:{	//位置
				formatted_address:	"重庆市江北区建新北路8号",	//结构化地址信息
				business: "",	//商圈信息，如 ，观音桥
				addressComponent:{
					country:"中国",	//国家
					province:"重庆市",	//省名
					city:"重庆市",	//城市名
					district:"江北区",	//区县名
					street: "",		//街道名称
					street_number:"",	//街道门牌号
					adcode:"130982",	//行政区划代码
					country_code: "",	//国家代码
					direction:"",		//和当前坐标点的方向，当有门牌号的时候返回数据
					distance:"" //和当前坐标点的距离，当有门牌号的时候返回数据
				},
				sematic_description: "红鼎国际名苑B座附近45米"		//当前位置结合POI的语义化结果描述。
			}
	};
	this.defaults = {
		id : "baiduMapContent", // 百度地图容器
		lng : 106.529857, // 初始化点,X，经度
		lat : 29.586325, // Y，纬度
		zoom : 12, // 初始化级别
		key : "Zvt09wAOQcdH95F8I9hwQZ6sniTwzGOw", // 申请的key
		imgUrl : "", // 图吧的路径
		data : {pointType:"gps",data:[]}, 		// 数据
		auto: true,	//true，自动创建地图，false，手动创建地图，调用 start()
		autoShowAllMarkers: false,	//自动显示所有标点。在 auto：true 时，则在自动创建地图后显示所有标点 
		dataMode : 1, // 数据模式，1，所有数据，2，分页数据
		pointConvert : { // 坐标点转换
			setdata : true, // 在设置数据的坐标转换，true：转换，false：不转换
			locus : true, // 轨迹回放时转换
			redrawing : true, // 重绘矩形/多边形时转换
			boundary: true,	//边界，行政区域
			route:true	//路线
		},
		drawingBeforeClearOverlays : true, // 绘画矩形/多边形之前，清除所有覆盖物
		searchBeforeShowAllMarkers : false, // 在拉框搜索之前，把 data:[] 里的标点全部显示在地图上
		searchMode: 1,	//搜索模式，1：本地模式，即在现有的  data 中搜索，2：远程模式，把矩形/多边形的坐标点传入到后台进行匹配，在返回来
		markerDisplayMode : 1, // 标点显示模式。1：在线离线都显示标点，2：只显示在线标点，3：只显示离线标点
		searchDisplayMode : 1, // 搜索到的标点，显示模式。1：在线离线都显示标点，2：只显示在线标点，3：只显示离线标点
		//在绘画并搜索模式下执行，但是在绘画完成后。
		//1.本地搜索模式
		//1.1如果是本地搜索者，则判断 data 中的标点，包含在该矩形/多边形内的数据，并显示标点在地图上
		//1.2并调用 localSearchComplete(data,drawingData) 函数,data:搜索到的标点，drawingData:绘制该矩形/多边形的数据，如：面积，边界点（坐标点），中心点，位置信息等
		localSearchComplete:function(){}, 
		//2.远程搜索模式
		//2.1如果是远程模式，则执行 remoteSearchCommplete(drawingData,callback)
		//2.2 drawingData:绘制该矩形/多边形的数据，如：面积，边界点（坐标点），中心点，位置信息等
		//2.3 【可选】 callback 回调函数，用于返回值。调用回调函数时需要传入远程搜索到的数据，数据格式：{pointType:"gps",data:[]}
		//2.4 其他自行处理
		remoteSearchCommplete:function(){},
		//绘画矩形/多边形，完成时执行的函数，并传递该形状的数据，如：面积，边界点（坐标点），中心点，位置信息等
		drawingComplete : function() {},
		 //边界-行政区域完成，返回坐标信息及面积位置
		boundaryComplete : function() {},
		styleOptions : { // 绘画的样式
			strokeColor : "#4E98DD", // 边线颜色。
			fillColor : "#4E98DD", // 填充颜色。当参数为空时，圆形将没有填充效果。
			strokeWeight : 2, // 边线的宽度，以像素为单位。
			strokeOpacity : 1, // 边线透明度，取值范围0 - 1。
			fillOpacity : 0.1, // 填充的透明度，取值范围0 - 1。
			strokeStyle : 'solid'// 边线的样式，solid或dashed
		},
		polylineOptions : { // 绘画线的样式
			strokeColor : "blue", // 颜色
			strokeWeight : 2, // 线的粗细度
			strokeOpacity : 1		// 透明度
		},
		locusPlayback:{		//轨迹回放方案
			/**
			 * 1：普通模式，
			 * 2：点模式（每隔10个点添加一个点），
			 * 3：距离模式（测试两个点的距离来显示，两个点的距离大于了设置值即显示）
			 * 4 : 收尾模式（只显示-第一个和最后一个）
			 */
			mode:1,			//模式。
			spacing: 10,	//2-点模式
			distance: 200,	//3-激励模式-大于 200 米显示
			second:10		//10 秒完成播放
		}
	}
	// 参数
	this.settings = null;
	/**
	 * 初始化
	 * 
	 * @param opts
	 *            配置参数
	 */
	this.init = function(opts) {
		// 合并参数设置
		this.settings = $.extend(true, this.defaults, opts);
		this.dataHandler($self.settings.data);
		if($self.settings.auto){
			this.start();
			if($self.settings.autoShowAllMarkers){
				this.showAllMarkersHandler($self.cdata);
			}
		}
	};
	
	/**
	 * 创建地图对象
	 */
	this.start = function() {
		if ($self.map == null) {
			$self.map = new BMap.Map($self.settings.id); // 创建百度地图并实例化
			var poi = new BMap.Point($self.settings.lng, $self.settings.lat); // 创建坐标点
			$self.map.centerAndZoom(poi, $self.settings.zoom); // 初始化
			$self.map.enableScrollWheelZoom(); // 允许鼠标滚动，放大缩小，不调用这个方法，默认不允许放大缩小
		}
	};
	
	/**
	 * 设置数据，数据格式 {pointType:"gps",data:[]}
	 * pointType：点类型，gps/baidu/google/tuba
	 * @param data 
	 */
	this.setData = function(data){
		this.dataHandler(data);
	};

	/**
	 * 设置数据并显示数据在地图上
	 * @param data 
	 */
	this.setDataAndShowMarkers = function(data,high){
		this.dataHandler(data,function(){
			$self.showAllMarkersHandler($self.cdata,high);
		});
	};
	
	
	/**
	 * 数据处理
	 * @param data 数据
	 * @param callback  回调函数
	 */
	this.dataHandler = function(data,callback){
		var pointType = data.pointType;
		$self.odata = null;
		$self.cdata = null;
		$self.odata = XXMI.ObjectUtils.deepClone(data.data);
		$self.cdata = XXMI.ObjectUtils.deepClone(data.data);
		//设置数据 data
		if($self.settings.pointConvert.setdata){
			var i;
			for(i in $self.cdata){
				if($self.cdata[i].lng > 0 && $self.cdata[i].lat > 0){
					var point = XXMI.PointUtils.convertPoint($self.cdata[i].lng,$self.cdata[i].lat,"baidu",pointType);						
					$self.cdata[i].lng = point.getLng();
					$self.cdata[i].lat = point.getLat();
				}
			}	
		}
		if(typeof(callback) != "undefined"){
			callback();
		}
	};
	
	/**
	 * 显示 data 中所有标点在地图上
	 */
	this.showAllMarkers = function(){
		this.showAllMarkersHandler($self.cdata);
	};
	
	/**
	 * 显示所有的标点 markers：标点集合 （包含坐标，标点信息）
	 * @param markers 标点集合
	 */
	this.showAllMarkersHandler= function(markers,high) {
		if(!(Object.prototype.toString.call(markers) === '[object Array]')){
			return;
		}
		this.removeMarkers();
		for (var i = 0; i < markers.length; i++) {
			if(markers[i].lng >0 && markers[i].lat >0 ){
				//在线离线都显示
				if($self.settings.markerDisplayMode == 1){
					if (markers[i].onLine) {
						if(high){
							this.addMarker(markers[i],"high");// 在线							
						}else{							
							this.addMarker(markers[i]);// 在线							
						}
					} else {
						this.addMarker(markers[i], "offLine"); // 离线
					}
				}//只显示在线
				else if($self.settings.markerDisplayMode == 2 && markers[i].onLine){
					if(high){
						this.addMarker(markers[i],"high");// 在线							
					}else{							
						this.addMarker(markers[i]);// 在线							
					}
				}//只显示离线
				else if($self.settings.markerDisplayMode == 3 && !markers[i].onLine){
					if(high){
						this.addMarker(markers[i],"high");// 在线							
					}else{							
						this.addMarker(markers[i],"offLine");//离线				
					}
				}
			}
		}
	};
	
	/**
	 * 添加标点
	 * @param mark 标点，包含：{"id":"A31001001","icon":"logistics.png","lng":"106.529857","remark":"备注","location":"重庆市江北区","description":"没有描述","name":"长安汽车","type":"类型1","lat":"29.586325","onLine":true};
	 * @param classType 标点提示CSS样式
	 */
	this.addMarker = function(mark, classType){
		var marker = this.addMarkerHandler(mark, classType);
		$self.markers.push(marker);
		return marker;
	};
	
	
	/**
	 * 添加标点-处理
	 * @param mark 标点，包含：{"id":"A31001001","icon":"logistics.png","lng":"106.529857","remark":"备注","location":"重庆市江北区","description":"没有描述","name":"长安汽车","type":"类型1","lat":"29.586325","onLine":true};
	 * @param classType 标点提示CSS样式
	 */
	this.addMarkerHandler = function(mark, classType){
		// 默认，在线
		var markClass = "bmap-mark-defult";
		if (typeof (classType) != "undefined") {
			// 高亮
			if (classType == "high") {
				markClass = "bmap-mark-high";
			}// 离线
			else if (classType == "offLine") {
				markClass = "bmap-mark-offline";
			}//高亮中的离线
			else if(classType == "highOffline"){
				markClass = "bmap-mark-highOffline";
			}
		}
		
		var markPoint = new BMap.Point(mark.lng, mark.lat);
		// 创建图标对象 -图片的大小，觉得标注显示信息的位置
		var myIcon = new BMap.Icon(
				$self.settings.imgUrl + mark.icon,
				new BMap.Size(31, 21), {
					// 指定定位位置。
					// 当标注显示在地图上时，其所指向的地理位置距离图标左上
					// 角各偏移10像素和25像素。您可以看到在本例中该位置即是
					// 图标中央下端的尖角位置。
					offset : new BMap.Size(10, 25),
				// 设置图片偏移。
				// 当您需要从一幅较大的图片中截取某部分作为标注图标时，您
				// 需要指定大图的偏移位置，此做法与css sprites技术类似。
				// imageOffset: new BMap.Size(0, 0 - index * 25) // 设置图片偏移
				});
		// 创建标注对象并添加到地图
		var marker = new BMap.Marker(markPoint, {
			icon : myIcon
		});
		$self.map.addOverlay(marker); // 将标注添加到地图中

		// 标点名称
		var label = new BMap.Label(mark.name, {
			offset : new BMap.Size(-5, 22)
		});
		label.setStyle({border : "none"});
		label.setContent('<div class="' + markClass + '">' + mark.name+ '</div>');
		marker.setLabel(label);
		// 添加标注事件
		marker.addEventListener("click", function() {
			// 标注信息窗口
			var opts = {
				width : 220, // 信息窗口宽度
				height : 183, // 信息窗口高度
			};
			// 弹出窗信息
			var html = '<div class="map-dialog">';
			html += '<div class="map-dialog-title">设备简述</div>';
			html += '<ul class="map-dialog-content">';
			html += '<li title="'+mark.deviceId+'">设备ID：' + mark.deviceId + '</li>';
			html += '<li title="'+mark.name +'">设备名称：' + mark.name + '</li>';
			html += '<li title="'+mark.type.keyName+'">设备类型：' + mark.type.keyName + '</li>';
			html += '<li title="'+mark.location+'">所在位置：' + mark.location + '</li>';
			var at = $("#accountType").val();
			if(typeof(at) != "undefined"){
				if(at != "system" && at != "firm"){
					html += '<li><a href="'+path+'/admin/sys/location/locusPlayback/'+mark.deviceId+'">轨迹回放</a></li>';									
				}
			}else{
				html += '<li><a href="'+path+'/admin/sys/location/locusPlayback/'+mark.deviceId+'">轨迹回放</a></li>';									
			}
			html += '</ul>';
			html += '</div>';
			var infoWindow = new BMap.InfoWindow(html, opts); // 创建信息窗口对象
			infoWindow.addEventListener("open", function() {
				// 延时0.2秒执行,更改百度原始的样式
				// <div style="box-sizing: content-box; width: 250px;
				// height: 170px; position: absolute; left: 16px; top: 16px;
				// z-index: 10; overflow: hidden;">
				window.setTimeout(function() {
					$('.map-dialog').parent().parent().css({
						"left" : "0",
						"top" : "0",
						"width" : "252px",
						"height" : "200px"
					});
					$('.map-dialog').show();
				}, 200);
			});
			// 在标注的地方显示信息窗口，
			marker.openInfoWindow(infoWindow, $self.map.getCenter()); // 打开信息窗口
		});
		return marker;
	};
	
	/**
	 * 移除所有标点
	 */
	this.removeMarkers = function(){
		if($self.map != null){
			for(var i=0;i<$self.markers.length;i++){
				$self.map.removeOverlay($self.markers[i]);
			}
			$self.markers.length = 0;
		}
	};
	

	/**
	 * 移除所有绘画对象
	 */
	this.removeDrawdings = function(){
		if($self.map != null){
			this.removeMarkers();
			for(var i=0;i<$self.drawings.length;i++){
				$self.map.removeOverlay($self.drawings[i]);
			}
			$self.drawings.length = 0;
		}
	};
	
	
	/**
	 * 移除所有重绘对象
	 */
	this.removeRedrawdings = function(){
		if($self.map != null){
			this.removeMarkers();
			for(var i=0;i<$self.redrawings.length;i++){
				$self.map.removeOverlay($self.redrawings[i]);
			}
			$self.redrawings.length = 0;
		}
	};
	/**
	 * 移除所有边界对象，行政区域
	 */
	this.removeBoundarys= function(){
		if($self.map != null){
			for(var i=0;i<$self.boundarys.length;i++){
				$self.map.removeOverlay($self.boundarys[i]);
			}
			$self.boundarys.length = 0;
		}
	};
	
	/**
	 * 移除【标点-轨迹】轨迹专用
	 */
	this.removeMarersLocus= function(){
		if($self.map != null){
			clearTimeout($self.locusPlayback.timeout);
			$self.map.removeOverlay($self.locusPlayback.polyline);
			$self.locusPlayback.polyline = null;
			for(var i=0;i<$self.locusPlayback.markers.length;i++){
				$self.map.removeOverlay($self.locusPlayback.markers[i]);
			}
			$self.locusPlayback.markers.length = 0;
			$self.locusPlayback.measure.lng = 0;
			$self.locusPlayback.measure.lat = 0;
			$self.locusPlayback.polylinePath= null;
			$self.locusPlayback.delay= 0;
			$self.locusPlayback.size= 0;
			$self.locusPlayback.index= 0;
			$self.locusPlayback.timeout= null;
		}
	};
	
	/**
	 * 清除所有覆盖物
	 */
	this.clearOverlays = function(){
		if($self.map != null){
			$self.map.clearOverlays();
			this.removeDrawdings();
			this.removeMarkers();
			this.removeMarersLocus();
			this.removeRedrawdings();
		}
	};
	
	/**
	 * 调整视野-   
	 * @param overlay 覆盖物
	 */
	this.setViewport = function (overlay){
		$self.map.setViewport(overlay.getPath());    //调整视野-   
	};
	
	/**
	 * 开启地图的绘制模式
	 */
	this.openDrawingMode = function(){
		this.drawingManager.open();
	};
	/**
	 * 关闭地图的绘制状态
	 */
	this.closeDrawingMode = function(){
		this.drawingManager.close();
	};
	
	/**
	 * 回调处理-外部
	 */
	this.fncbHandler = function(callback){
		fncallback = null;
		if(typeof(callback) != "undefined"){
			fncallback = callback;
		}
	};
	
	/**
	 * 执行回调函数-外部
	 */
	this.excallback=function(data){
		if(fncallback != null){
			fncallback(data);
		}
	};
	//存放外部回调函数
	var fncallback = null;
	/**
	 * 绘画-矩形
	 * @param callback
	 */
	this.drawingRectangle = function(callback){
		$self.fncbHandler(callback);
		$self.drawingSign = 1;
		this.drawingModeBeforeHandler();
		this.drawingManager.	setDrawingMode(BMAP_DRAWING_RECTANGLE);	//绘画模式
	};
	
	/**
	 * 绘画-多边形
	 */
	this.drawingPolygon = function(callback){
		$self.fncbHandler(callback);
		$self.drawingSign = 1;
		this.drawingModeBeforeHandler();
		this.drawingManager.	setDrawingMode(BMAP_DRAWING_POLYGON);	//绘画模式
	};
	
	/**
	 * 绘画-矩形并搜索
	 */
	this.drawingRectangleAndSearch = function(callback){
		$self.fncbHandler(callback);
		$self.drawingSign = 2;
		this.drawingModeBeforeHandler();
		this.searchBeforeShowAllMarkers();
		this.drawingManager.	setDrawingMode(BMAP_DRAWING_RECTANGLE);	//绘画模式
	};
	
	/**
	 * 绘画-多边形并搜索
	 */
	this.drawingPolygonAndSearch = function(callback){
		$self.fncbHandler(callback);
		$self.drawingSign = 2;
		this.drawingModeBeforeHandler();
		this.searchBeforeShowAllMarkers();
		this.drawingManager.setDrawingMode(BMAP_DRAWING_POLYGON);	//绘画模式
	};
	
	/**
	 * 在拉框搜索之前，把 data:[] 里的标点全部显示在地图上
	 */
	this.searchBeforeShowAllMarkers = function(){
		if($self.settings.searchBeforeShowAllMarkers){
			this.removeMarkers();
			this.showAllMarkers($self.cdata);
		}
	};
	
	
	/**
	 * 绘画模式之前的处理
	 */
	this.drawingModeBeforeHandler = function(){
		// 绘画矩形/多边形之前，清除所有覆盖物标点
		if($self.settings.drawingBeforeClearOverlays){
			this.removeMarkers();
		}
		this.removeBoundarys();	//移除边界对象
		this.removeRedrawdings();	//移除重绘对象
		this.removeDrawdings();	//移除绘画对象
		this.startDrawing();	//开始绘画
		this.openDrawingMode();	//打开绘画模式
	};
	
	/**
	 * 绘画工具，标点、圆形、多边形、线行、矩形
	 */
	this.startDrawing = function() {
		if(this.drawingManager == null){
			// 实例化鼠标绘制工具
			$self.drawingManager = new BMapLib.DrawingManager($self.map, {
				isOpen : false, // 是否开启绘制模式
				enableDrawingTool : false,
				drawingToolOptions : {
					anchor : BMAP_ANCHOR_TOP_RIGHT, // 位置
					offset : new BMap.Size(5, 5), // 偏离值
				},
				polygonOptions : $self.settings.styleOptions, // 多边形的样式
				rectangleOptions : $self.settings.styleOptions	//矩形样式
			});	
//			$self.drawingManager.enableCalculate(); //开启计算模式
			//绘画完成
			this.drawingManager.addEventListener('overlaycomplete', function(e) {
				if($self.drawingSign == 1){
					$self.setViewport(e.overlay);					
				}
				$self.drawings.push(e.overlay);
				$self.drawingCompleteGetDrawingData(e,function(){
					$self.excallback(XXMI.ObjectUtils.deepClone($self.drawingData));
					//绘制并搜索
					if($self.drawingSign == 2){
						window.setTimeout(function(){
							$self.drawingCompleteSearchPolygonInMarkers(e.overlay,$self.drawingData);
						}, 100);
					}
				});
				$self.closeDrawingMode();
			});
		}
	};
	
	/**
	 * TODO 绘画矩形完成后，获取【面积-点】的数据，
	 * @param e 绘画完成-事件传递过来的对象
	 * @param callback 回调函数
	 */
	this.drawingCompleteGetDrawingData = function (e,callback){
		$self.drawingData.mode = e.drawingMode;
		$self.drawingData.points.length = 0;
		var overlay = e.overlay;
		var points = overlay.getPath();
		for(var i in points){
			$self.drawingData.points.push(points[i]);
		}
		var area = BMapLib.GeoUtils.getPolygonArea(overlay.getPath()).toFixed(2);//平方米
		$self.drawingData.area = area === "NaN" ? -1:area;
		var bounds = overlay.getBounds();
        var sw = bounds.getSouthWest(); //西南脚点
        var ne = bounds.getNorthEast(); //东北脚点
        $self.drawingData.sw = {lng:sw.lng,lat:sw.lat};
        $self.drawingData.ne = {lng:ne.lng,lat:ne.lat};
        
        //中心点
		var center = bounds.getCenter();	//.getCenter() 返回 Point 类型
		$self.drawingData.center.lng = center.lng;
		$self.drawingData.center.lat = center.lat;
		//根据坐标获取地址
		var cadata = {pointType:"baidu",lng:center.lng,lat:center.lat};
		XXMI.MapUtils.getCoordToAddress(cadata,function(xresult){
			$self.drawingData.location.formatted_address = xresult.formatted_address;
			$self.drawingData.location.business = xresult.business;
			$self.drawingData.location.addressComponent =
				$.extend(true, $self.drawingData.location.addressComponent,xresult.addressComponent);
			$self.drawingData.location.sematic_description = xresult.sematic_description;
			window.setTimeout(function(){	//解决阻塞
				$self.settings.drawingComplete(XXMI.ObjectUtils.deepClone($self.drawingData));
			}, 0);
			//执行回调函数
			callback();
		});
	};
	
	/**
	 * 绘画完成后，搜索多边形框内包含的标点
	 * @param polygon 多边形框
	 * @param drawingData 绘制数据
	 */
	this.drawingCompleteSearchPolygonInMarkers = function(polygon,drawingData){
		this.removeMarkers();
		//本地搜索模式
		if($self.settings.searchMode == 1){
			var smdata = this.searchPolygonInMarkers(polygon);
			$self.settings.localSearchComplete(smdata,XXMI.ObjectUtils.deepClone(drawingData));
		}
		//远程搜索模式
		else if($self.settings.searchMode == 2){
			$self.settings.remoteSearchCommplete(XXMI.ObjectUtils.deepClone(drawingData),function(rdata){
				$self.showSearchMarkers(rdata);
			});
		}
	};
	
	/**
	 * 搜索多边形中包含的标点-本地搜索
	 * @param polygon 矩形对象
	 * @returns markers 搜索到的标点【数组】
	 */
	this.searchPolygonInMarkers = function(polygon){
		this.removeMarkers();
		var searchMarkers = new Array();
		for (var i in $self.cdata) {
			//显示离线都显示
			if($self.settings.searchDisplayMode == 1){
				if(this.isPointInPolygon($self.cdata[i].lng, $self.cdata[i].lat, polygon)){
					if($self.cdata[i].onLine){
						$self.addMarker($self.cdata[i], "high");
					}else{
						$self.addMarker($self.cdata[i], "highOffline");
					}
					searchMarkers.push($self.odata[i]);	//返回原数据
				}
			}//显示在线
			else if($self.settings.searchDisplayMode == 2 && $self.cdata[i].onLine){
				if(this.isPointInPolygon($self.cdata[i].lng, $self.cdata[i].lat, polygon)){
					$self.addMarker($self.cdata[i], "high");
					searchMarkers.push($self.odata[i]);	//返回原数据
				}
			}//显示离线
			else if($self.settings.searchDisplayMode == 3 && !$self.cdata[i].onLine){
				if(this.isPointInPolygon($self.cdata[i].lng, $self.cdata[i].lat, polygon)){
					$self.addMarker($self.cdata[i], "highOffline");
					searchMarkers.push($self.odata[i]);	//返回原数据
				}
			}
		}
		return {pointType:$self.settings.data.pointType,data:XXMI.ObjectUtils.deepClone(searchMarkers)};
	};
	
	/**
	 * 显示远程搜索到的数据
	 * @param data 数据格式：{pointType:"gps",data:[]}
	 */
	this.showSearchMarkers = function(data){
		if($self.settings.pointConvert.setdata){
			var pointType = data.pointType;
			var i;
			for(i in data.data){
				var point = XXMI.PointUtils.convertPoint(data.data[i].lng,data.data[i].lat,"baidu",pointType);
				data.data[i].lng = point.getLng();
				data.data[i].lat = point.getLat();
			}
		}
		for (var i in data.data) {
			//显示离线都显示
			if($self.settings.searchDisplayMode == 1){
				if(data.data[i].onLine){
					$self.addMarker(data.data[i], "high");
				}else{
					$self.addMarker(data.data[i], "highOffline");
				}
			}//显示在线
			else if($self.settings.searchDisplayMode == 2 && data.data[i].onLine){
				$self.addMarker(data.data[i], "high");
			}//显示离线
			else if($self.settings.searchDisplayMode == 3 && !data.data[i].onLine){
				$self.addMarker(data.data[i], "highOffline");
			}
		}
	};
	
	/**
	 * 判断点是否在矩形-多边形内, 是：true，否：false
	 * @param lng 
	 * @param lat
	 * @param polygon 多边形
	 * @returns boolean true:false
	 */
	this.isPointInPolygon = function(lng,lat,polygon){
		return BMapLib.GeoUtils.isPointInPolygon(new BMap.Point(lng,lat), polygon);
	};
	
	
	$self.locusData = null;
	/**
	 * 轨迹回放
	 * 数据格式：{pointType:"gps",marker:{id:"",name:""},points":[{"at":"2016-06-02 11:51:23.000","lng":106.48199131608,"lat":29.564738886986003}]}
	 * @param data
	 */
	this.locus = function(data,callback){
		$self.locusData = null;
		$self.fncbHandler(callback);
		this.clearOverlays();
		$self.locusData = XXMI.ObjectUtils.deepClone(data);	//深度克隆
		//转换
		if($self.settings.pointConvert.locus){
			var pointType = $self.locusData.pointType;
			var i;				
			for(i in $self.locusData.points){
				var point = XXMI.PointUtils.convertPoint($self.locusData.points[i].lng,$self.locusData.points[i].lat,"baidu",pointType);
				$self.locusData.points[i].lng = point.getLng();
				$self.locusData.points[i].lat = point.getLat();
			}
		}
		$self.locusHandler();
	};
	
	/**
	 * 移动到中心点
	 * @param lng
	 * @param lat
	 */
	this.panTo = function(lng,lat){
//		$self.map.panTo(new BMap.Point(lng,lat));	//中心点移动，这个不行
		$self.map.setCenter(new BMap.Point(lng,lat));	 //这个效果好
	};
	
	/**
	 * TODO 轨迹处理
	 */
	this.locusHandler = function(){
		this.removeMarersLocus();	//移除标点轨迹
		clearTimeout($self.locusPlayback.timeout);
		$self.locusPlayback.size = $($self.locusData.points).size();
		$self.locusPlayback.delay = 1000/($self.locusPlayback.size/$self.settings.locusPlayback.second);	//计算多时间执行一次
		$self.locusPlayback.polylinePath = null;
		$self.locusPlayback.polylinePath = new Array();
		$self.locusPlayback.polyline = null;
		$self.locusPlayback.polyline = new BMap.Polyline($self.locusPlayback.polylinePath,$self.settings.polylineOptions);    
		$self.map.addOverlay($self.locusPlayback.polyline);
		$self.locusPlayback.index =0;
		if($self.locusPlayback.size >1){
			$self.locusPlayback.playback();			
		}else{
			var point = XXMI.PointUtils.convertPoint($self.locusData.data.lng,$self.locusData.data.lat,"baidu",$self.locusData.pointType);
			$self.locusData.data.lng = point.getLng();
			$self.locusData.data.lat = point.getLat();
			$self.setLocation($self.locusData.data,true);
		}
	};
	
	/**
	 * 添加标点-轨迹【轨迹专用】
	 * @param mark 标点，包含：{"id":"A31001001","icon":"logistics.png","lng":"106.529857","remark":"备注","location":"重庆市江北区","description":"没有描述","name":"长安汽车","type":"类型1","lat":"29.586325","onLine":true};
	 * @param index
	 */
	this.addMarkerLocus = function(marker, index){
		var mark = null;
		if(index == 1 || index == $self.locusPlayback.size){
			mark  = XXMI.ObjectUtils.deepClone(marker);
			if(index == 1){
				mark.name = mark.name+"-开始";
			}else if(index == $self.locusPlayback.size){
				mark.name = mark.name+"-结束";
			}
		}else{
			mark = marker;
		}
		
		if($self.settings.locusPlayback.mode == 2){
			if(index % $self.settings.locusPlayback.spacing ==0 || index == 1 || 
					index == $self.locusPlayback.size){
				$self.setLocation(mark,true);
			}
		}else if($self.settings.locusPlayback.mode == 3){
			if(index == 1 || index == $self.locusPlayback.size){
				$self.setLocation(mark,true);
			}else {
				if($self.locusPlayback.measure.lng >0 && $self.locusPlayback.measure.lat >0){
					var p1 = new BMap.Point($self.locusPlayback.measure.lng,$self.locusPlayback.measure.lat);
					var p2 = new BMap.Point(mark.lng,mark.lat);
					var mi = BMapLib.GeoUtils.getDistance(p1, p2);
					if(mi > $self.settings.locusPlayback.distance){
						$self.locusPlayback.measure.lng = mark.lng;
						$self.locusPlayback.measure.lat = mark.lat;
						$self.setLocation(mark,true);
					}
				}else{
					$self.locusPlayback.measure.lng = mark.lng;
					$self.locusPlayback.measure.lat = mark.lat;
				}
			}
		}else if($self.settings.locusPlayback.mode == 4){
			if(index == 1 || index == $self.locusPlayback.size){
				$self.setLocation(mark);
			}
		}else if($self.settings.locusPlayback.mode == 1){
			$self.setLocation(mark);
		}
		
		//中心点移动
		if($self.settings.locusPlayback.mode == 1 || $self.settings.locusPlayback.mode == 4){
			$self.panTo(mark.lng,mark.lat);	
		}
	};
	
	/**
	 * 设置位置
	 */
	this.setLocation = function(mark,panTo){
		XXMI.MapUtils.getCoordToAddress(mark,function(rd){
			if(typeof(rd.formatted_address) != "undefined"){
				mark.location = rd.formatted_address;						
			}
			var mk = $self.addMarkerHandler(mark, "high");
			$self.locusPlayback.markers.push(mk);
			if(typeof(panTo) != "undefined"){
				$self.panTo(mark.lng,mark.lat);	//中心点移动				
			}
		});
	};
	
	/**
	 * 暂停轨迹播放
	 */
	this.pauseLoucs = function(){
		clearTimeout($self.locusPlayback.timeout);
	};
	
	/**
	 * 继续轨迹播放
	 */
	this.continueLoucs = function(){
		if($self.locusPlayback.index < $self.locusPlayback.size){
			$self.locusPlayback.playback();			
		}
	};
	
	/**
	 * 轨迹回放
	 */
	this.locusPlayback={
			polyline:null,		//存放线对象
			markers:[],		//存放点对象
			measure:{lng:0,lat:0},		//存放测量点
			polylinePath: [],		//存放画线的点
			delay: 1000,	//多久执行下一个点
			size: 0,	//轨迹点最大值
			index:0,	//当前执行点的下标
			timeout: null,
			/**
			 * @param polyline 线对象
			 * @param pps 点集合
			 * @param marker 标点
			 * @param points 轨迹点
			 * @param size 轨迹点最大值
			 * @param index 下标
			 * @param delay 延期毫秒
			 */
			playback:function(){
				$self.locusData.data.lng = $self.locusData.points[$self.locusPlayback.index].lng;
				$self.locusData.data.lat = $self.locusData.points[$self.locusPlayback.index].lat;
				$self.locusPlayback.polylinePath.push(new BMap.Point($self.locusData.points[$self.locusPlayback.index].lng,$self.locusData.points[$self.locusPlayback.index].lat));
				$self.locusPlayback.polyline.setPath($self.locusPlayback.polylinePath);
				$self.addMarkerLocus($self.locusData.data,$self.locusPlayback.index+1);
				$self.locusPlayback.index++;
				if($self.locusPlayback.index < $self.locusPlayback.size){
					$self.locusPlayback.timeout =window.setTimeout(
						function(){
							$self.locusPlayback.playback();
						},$self.locusPlayback.delay);
				}else{
					$self.excallback();
				}
			}
	};
	
	this.redrawingSign = 1;	//1：重绘，2：重绘并搜索
	
	/**
	 * 重绘多边形
	 * @param drawingData 绘画的数据
		var drawingData = {
				name: "google",	//地图名称
				mode: "rectangle",		//绘画模式【rectangle : 矩形】、【polygon：多边形】
				area: 0,			//绘画的面积
				points: [],	//绘画【矩形-多边形】的点数据，Google 矩形顺序 leftTop-leftBottom-rightBottom-rightTop
				location:{},	//地址信息
				center":{"lng":106.79776799999999,"lat":29.7313945},
				sw":{"lng":106.68221,"lat":29.625515},
				"ne":{"lng":106.913326,"lat":29.837274}
		};
	 */
	this.redrawing = function(drawingData,callback){
		this.redrawingSign = 1;
		$self.fncbHandler(callback);
		if(typeof(drawingData) != "undefined" && drawingData.points.length > 0){
			this.redrawingConvert(XXMI.ObjectUtils.deepClone(drawingData));
		}
		$self.excallback();
	};
	
	/**
	 * 搜索重绘
	 * @param drawingData 绘画的数据
	 */
	this.redrawingSearch = function(drawingData,callback){
		this.redrawingSign = 2;
		$self.fncbHandler(callback);
		if(typeof(drawingData) != "undefined" && drawingData.points.length > 0){
			var drawData = XXMI.ObjectUtils.deepClone(drawingData);
			this.drawingCompleteSearchPolygonInMarkers(this.redrawingConvert(drawData), XXMI.ObjectUtils.deepClone(drawingData));
			$self.excallback();
		}
	};
	
	
	/**
	 * 重绘多边形-转换
	 * @param drawingData 绘画【矩形-多边形】的点数据
	 * @returns polygon
	 */
	this.redrawingConvert = function(drawingData){
		this.removeDrawdings();	//删除绘画对象
		this.removeRedrawdings();	//删除重绘对象
		this.removeBoundarys();	//删除边界对象

		var pointType = drawingData.name;
		var points = drawingData.points;		//点数据
		//重绘转换
		if($self.settings.pointConvert.redrawing){
			var i;
			for(i in points){
				var point = XXMI.PointUtils.convertPoint(points[i].lng,points[i].lat,"baidu",pointType);
				points[i].lng = point.getLng();
				points[i].lat = point.getLat();
			}
		}
		return this.redrawingHandler(points);
	};
	
	/**
	 * 重绘-处理
	 */
	this.redrawingHandler = function(points){
		var pps = [];
		for(var i in points){
			pps.push(new BMap.Point(points[i].lng,points[i].lat));
		}
	    var polygon = new BMap.Polygon(pps,$self.settings.styleOptions);
	    $self.map.addOverlay(polygon);      
		$self.redrawings.push(polygon);
		window.setTimeout(function(){
			if($self.redrawingSign == 1){
				$self.setViewport(polygon);	//只能在重绘的时候才用最佳视觉，搜索时不用				
			}
		}, 50);
		return polygon;
	};
	
	/**
	 * 刷新，将删除所有的覆盖物，包括【标点，轨迹，矩形，多边形，重绘】
	 * 并重新把 $self.cdata 里面的数据标点，显示在地图上
	 */
	this.refresh = function(){
		this.clearOverlays();
		this.showAllMarkers();
	};
	

	/**
	 * TODO 行政区域查询
	 * @param name 查询省、直辖市、地级市、或县的名称
	 * @param callback 回调函数
	 */
	this.administrativeSelect = function(name,callback){
		var polygon  = null;
		this.clearOverlays();
		this.removeBoundarys();
		XXMI.MapUtils.boundary(name,function(boundaries){
			if(boundaries.length <=0 ){
				alert("没有查询到【"+name+"】行政区域，请注意查询格式【省、直辖市、地级市、或县的名称】");
				return;
			}else{
				//为什么要截取 boundaries[0]，发现第一个点与最后一个相同点，就计算不出面积，所有通过反复设置发现，去掉最后一个点，就能计算出来了 
				var points =boundaries[0].substring(0, boundaries[0].lastIndexOf(";"));
				polygon = new BMap.Polygon(points, $self.settings.styleOptions); //建立多边形覆盖物  
				$self.map.addOverlay(polygon);  //添加覆盖物  
	            $self.setViewport(polygon);           
	            $self.boundarys.push(polygon);
	            $self.getAdministrativeData(polygon,function(boundaryData){
	            	if(XXMI.ObjectUtils.getClass(callback) !== "Undefined"){
		            	callback(boundaryData,polygon);
		            }
	            });
			}
		});
	};
	
	/**
	 * TODO 行政区域查询并搜索该区域内包含的标点
	 * @param name 查询省、直辖市、地级市、或县的名称
	 */
	this.administrativeSelectAndSearchInMarkers = function(name){
		this.administrativeSelect(name,function(boundaryData,polygon){
			$self.drawingCompleteSearchPolygonInMarkers(polygon,boundaryData);
		});
	};
	
	/**
	 * TODO 获取行政区域的数据，面积、边界点、位置信息
	 * @param polygon 矩形对象
	 * @param callback 回调函数
	 */
	this.getAdministrativeData = function (polygon,callback){
		$self.boundaryData.mode = "polygon";
		$self.boundaryData.points.length = 0;
		var points = polygon.getPath();
		for(var i in points){
			$self.boundaryData.points.push(points[i]);
		}
		var area = BMapLib.GeoUtils.getPolygonArea(polygon.getPath()).toFixed(2);//平方米
		$self.boundaryData.area = area === "NaN" ? -1:area;
		var bounds = polygon.getBounds();
        var sw = bounds.getSouthWest(); //西南脚点
        var ne = bounds.getNorthEast(); //东北脚点
        $self.boundaryData.sw = {lng:sw.lng,lat:sw.lat};
        $self.boundaryData.ne = {lng:ne.lng,lat:ne.lat};
        
        //中心点
		var center = bounds.getCenter();	//.getCenter() 返回 Point 类型
		$self.boundaryData.center.lng = center.lng;
		$self.boundaryData.center.lat = center.lat;
		//根据坐标获取地址
		var cadata = {pointType:"baidu",lng:center.lng,lat:center.lat};
		XXMI.MapUtils.getCoordToAddress(cadata,function(xresult){
			$self.boundaryData.location.formatted_address = xresult.formatted_address;
			$self.boundaryData.location.business = xresult.business;
			$self.boundaryData.location.addressComponent =
				$.extend(true, $self.boundaryData.location.addressComponent,xresult.addressComponent);
			$self.boundaryData.location.sematic_description = xresult.sematic_description;
			window.setTimeout(function(){	//解决阻塞
				$self.settings.boundaryComplete(XXMI.ObjectUtils.deepClone($self.boundaryData));
			}, 0);
			//执行回调函数
			callback(XXMI.ObjectUtils.deepClone($self.boundaryData));
		});
	};
	
	/**
	 * 获取驾驶线路之间点
	 */
	this.route = function(slng,slat,elng,elat,callback){
		var startPoint = new BMap.Point(slng,slat);    //起点-重庆大学A区
		var endPoint = new BMap.Point(elng,elat);    //终点-麒麟座
		var driving = new BMap.DrivingRoute($self.map);    //创建驾车实例
		driving.search(startPoint, endPoint);                 //第一个驾车搜索，重庆大学-麒麟座
		driving.setSearchCompleteCallback(function(){
	        var path = driving.getResults().getPlan(0).getRoute(0).getPath();    //通过驾车实例，获得一系列点的数组
	        var polyline = new BMap.Polyline(path);
	        $self.map.addOverlay(polyline);
	        if(callback){
	        	callback(path);
	        }
		});
	};
	
	/**
	 * 查看多个点的路线
	 * @param pointStr 格式 111.123,23.123;111.333,24,45;123.109,22.111
	 * @param callback 回调函数
	 */
	this.moreRoute = function(pointStr,callback,pointType){
		if(typeof(pointType) == "undefined"){
			pointType = "baidu";
		}
		pointStr = pointStr.trim();
		if(pointStr.length >0 && pointStr != ""){
			var ps =pointStr.split(";");
			var points = new Array();
			for(var i=0;i<ps.length;i++){
				var ppt = ps[i].split(",");
				if($self.settings.pointConvert.route){
					var point = XXMI.PointUtils.convertPoint(ppt[0],ppt[1],"baidu",pointType);
					points.push({lng:point.getLng(),lat:point.getLat()});
				}else{
					points.push({lng:ppt[0],lat:ppt[1]});
				}
			}
			if(points.length >=2){
				var pointsArray = [];
				var index = 1;
				this.recursionRoute(pointsArray,points,index,function(pdata){
					if(callback){
						callback(pdata);
					}
				});
			}
		}
	};
	
	/**
	 * 递归路线
	 * 保存顺序
	 */
	this.recursionRoute = function(pointsArray,points,index,callback){
		this.route(points[index-1].lng, points[index-1].lat, points[index].lng, points[index].lat,function(path){
			pointsArray = pointsArray.concat(path);
			index++;
			if(index < points.length){
				$self.recursionRoute(pointsArray,points,index,callback);
			}else{
				callback(pointsArray);
			}
		});
	}
	
	
	
	this.init(opts)
	return $self;
}

// 重庆 106.547391,29.572254
