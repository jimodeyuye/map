/**
 * 所有工具类都放在Utils下
 */
var Utils = window.Utils = Utils || {};

/**
 * 对象工具
 */
(function() {
	var ObjectUtils =
	/**
	 * ObjectUtils类，静态类，勿需实例化即可使用
	 * 
	 * @class ObjectUtils类的<b>入口</b>。 该类提供的都是静态方法，勿需实例化即可使用。
	 */
	Utils.ObjectUtils = function() {
	}

	/**
	 * 获取对象类型
	 * 
	 * @param object
	 * @returns 对象类型
	 */
	ObjectUtils.getClass = function(object) {
		if (object === null)
			return "Null";
		if (object === undefined)
			return "Undefined";
		return Object.prototype.toString.call(object).slice(8, -1);
	}
	/**
	 * 深度克隆
	 * 
	 * @param object
	 *            克隆对象
	 * @returns Object
	 */
	ObjectUtils.deepClone = function(object) {
		var result = {}, oClass = ObjectUtils.getClass(object);
		if (oClass === "Object") {
			result = {};
		} else if (oClass === "Array") {
			result = [];
		} else {
			return object;
		}
		for (key in object) {
			var copy = object[key];
			if (ObjectUtils.getClass(copy) == "Object") {
				result[key] = arguments.callee(copy);
			} else if (ObjectUtils.getClass(copy) == "Array") {
				result[key] = arguments.callee(copy);
			} else {
				result[key] = object[key];
			}
		}
		return result;
	}
})();// 闭包

/**
 * 日期工具
 */
(function() {
	var DateUtils =
	/**
	 * DateUtils类，静态类，勿需实例化即可使用
	 * 
	 * @class DateUtils类的<b>入口</b>。 该类提供的都是静态方法，勿需实例化即可使用。
	 */
	Utils.DateUtils = function() {
	}

	/**
	 * 日期格式化
	 * 
	 * @param formatStr
	 *            格式化
	 * @returns
	 */
	Date.prototype.Format = function(formatStr) {
		var str = formatStr;
		var Week = [ '日', '一', '二', '三', '四', '五', '六' ];
		str = str.replace(/yyyy|YYYY/, this.getFullYear());
		str = str.replace(/yy|YY/,
				(this.getYear() % 100) > 9 ? (this.getYear() % 100).toString()
						: '0' + (this.getYear() % 100));

		str = str.replace(/MM/, this.getMonth() > 9 ? this.getMonth()
				.toString() : '0' + this.getMonth());
		str = str.replace(/M/g, this.getMonth());

		str = str.replace(/w|W/g, Week[this.getDay()]);

		str = str.replace(/dd|DD/, this.getDate() > 9 ? this.getDate()
				.toString() : '0' + this.getDate());
		str = str.replace(/d|D/g, this.getDate());

		str = str.replace(/hh|HH/, this.getHours() > 9 ? this.getHours()
				.toString() : '0' + this.getHours());
		str = str.replace(/h|H/g, this.getHours());
		str = str.replace(/mm/, this.getMinutes() > 9 ? this.getMinutes()
				.toString() : '0' + this.getMinutes());
		str = str.replace(/m/g, this.getMinutes());

		str = str.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds()
				.toString() : '0' + this.getSeconds());
		str = str.replace(/s|S/g, this.getSeconds());
		return str;
	}

	/**
	 * 获取当前日期 示例： var date = Utils.DateUtils.getNowDate("yyyy-MM-dd");
	 * 
	 * @param format
	 *            格式化，如：yyyy-MM-dd
	 */
	DateUtils.getNowDate = function(format) {
		var now = new Date();
		now.setMonth(now.getMonth() + 1);
		return now.Format(format);
	}

	/**
	 * 获取当前日期之前的日期 示例： 当前日期：2016-01-11 var date =
	 * Utils.DateUtils.getNowDateBefore("yyyy-MM-dd",1); 打印：date == 2016-01-10
	 * 
	 * @param format
	 *            格式化，如：yyyy-MM-dd
	 * @param beforeDay
	 *            之前的某天
	 */
	DateUtils.getNowDateBefore = function(format, beforeDay) {
		var now = new Date();
		now.setDate(now.getDate() - beforeDay);
		now.setMonth(now.getMonth() + 1);
		return now.Format(format);
	}

	/**
	 * 获取当前日期时间
	 * 
	 * @returns 2016-07-06 14:14:12
	 */
	DateUtils.getNowDateTime = function() {
		if (typeof (beforeHours) == "undefined") {
			beforeHours = 0;
		}
		var now = new Date();
		now.setMonth(now.getMonth() + 1);
		now.setHours(now.getHours() - beforeHours, now.getMinutes(), now
				.getSeconds(), now.getMilliseconds());
		return now.Format("yyyy-MM-dd hh:mm:ss");
	}

	/**
	 * 获取当前日期时间之前的某个小时
	 * 
	 * @param beforeHours
	 *            之前的某个小时
	 * @returns 2016-07-06 14:14:12
	 */
	DateUtils.getNowDateTimeBeforeHours = function(beforeHours) {
		if (typeof (beforeHours) == "undefined") {
			beforeHours = 0;
		}
		var now = new Date();
		now.setMonth(now.getMonth() + 1);
		now.setHours(now.getHours() - beforeHours, now.getMinutes(), now
				.getSeconds(), now.getMilliseconds());
		return now.Format("yyyy-MM-dd hh:mm:ss");
	}

	/**
	 * 获取当前日期时间之后的某个小时
	 * 
	 * @param beforeHours
	 *            之后的某个小时
	 * @returns 2016-07-06 14:14:12
	 */
	DateUtils.getNowDateTimeAfterHours = function(afterHours) {
		if (typeof (afterHours) == "undefined") {
			afterHours = 0;
		}
		var now = new Date();
		now.setMonth(now.getMonth() + 1);
		now.setHours(now.getHours() + afterHours, now.getMinutes(), now
				.getSeconds(), now.getMilliseconds());
		return now.Format("yyyy-MM-dd hh:mm:ss");
	}

	/**
	 * 获取指定日期时间之前的某个小时
	 * 
	 * @param dateTime
	 *            指定的日期时间: 2016-07-06 14:14:12
	 * @param beforeHours
	 *            之前的某个小时
	 * @returns 2016-07-06 14:14:12
	 */
	DateUtils.getAssignNowDateTimeBeforeHours = function(dateTime, beforeHours) {
		if (typeof (beforeHours) == "undefined") {
			beforeHours = 0;
		}
		var now = new Date(dateTime);
		now.setMonth(now.getMonth() + 1);
		now.setHours(now.getHours() - beforeHours, now.getMinutes(), now
				.getSeconds(), now.getMilliseconds());
		return now.Format("yyyy-MM-dd hh:mm:ss");
	}
	
	/**
	 * 获取指定日期时间之后的某个小时
	 * 
	 * @param dateTime
	 *            指定的日期时间: 2016-07-06 14:14:12
	 * @param afterHours
	 *            之后的某个小时
	 * @returns 2016-07-07 14:14:12
	 */
	DateUtils.getAssignNowDateTimeAfterHours = function(dateTime, afterHours) {
		if (typeof (afterHours) == "undefined") {
			afterHours = 0;
		}
		var now = new Date(dateTime);
		now.setMonth(now.getMonth() + 1);
		now.setHours(now.getHours() + afterHours, now.getMinutes(), now
				.getSeconds(), now.getMilliseconds());
		return now.Format("yyyy-MM-dd hh:mm:ss");
	}

})();

/**
 * 地图坐标点转换工具类，PointUtils 各地图API坐标系统比较与转换;
 * WGS84坐标系：即地球坐标系，国际上通用的坐标系。设备一般包含GPS芯片或者北斗芯片获取的经纬度为WGS84地理坐标系,
 * 谷歌地图采用的是WGS84地理坐标系（中国范围除外，中国用GCJ-02）;
 * GCJ02坐标系：即火星坐标系，是由中国国家测绘局制订的地理信息系统的坐标系统。由WGS84坐标系经加密后的坐标系。
 * 谷歌中国地图和搜搜中国地图采用的是GCJ02地理坐标系; BD09坐标系：即百度坐标系，GCJ02坐标系经加密后的坐标系;
 * 搜狗坐标系、图吧坐标系等，估计也是在GCJ02基础上加密而成的。
 */
(function() {
	var x_pi = 3.14159265358979324 * 3000.0 / 180.0;
	var pi = 3.1415926535897932384626;
	var a = 6378245.0;
	var ee = 0.00669342162296594323;
	var PointUtils =
	/**
	 * PointUtils 类，静态类，勿需实例化即可使用
	 * 
	 * @class PointUtils类的<b>入口</b>。 该类提供的都是静态方法，勿需实例化即可使用。
	 */
	Utils.PointUtils = function() {
	}

	/**
	 * 坐标点
	 * 
	 * @param pointLng
	 *            经度
	 * @param pointLat
	 *            纬度
	 */
	PointUtils.Point = function(pointLng, pointLat) {
		var lng = pointLng, lat = pointLat;
		this.getLng = function() {
			return lng;
		}
		this.getLat = function() {
			return lat;
		}
	}

	/**
	 * GPS（WGS-84） 经纬度坐标 转 GCJ-02（中国标准坐标），谷歌采用的是 GCJ-02<br>
	 * GPS ：坐标即 WGS-84 国际标准坐标<br>
	 * GCJ-02 ：中国标准坐标
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.wgs84_To_Gcj02 = function(lng, lat) {
		if (PointUtils.outOfChina(lng, lat)) {
			return null;
		}
		var dLat = PointUtils.transformLat(lng - 105.0, lat - 35.0);
		var dLng = PointUtils.transformLng(lng - 105.0, lat - 35.0);
		var radLat = lat / 180.0 * pi;
		var magic = Math.sin(radLat);
		magic = 1 - ee * magic * magic;
		var sqrtMagic = Math.sqrt(magic);
		dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
		dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
		var mgLat = lat + dLat;
		var mgLng = lng + dLng;
		return new PointUtils.Point(mgLng, mgLat);
	}

	/**
	 * GCJ-02（中国标准坐标）转 GPS（WGS-84） 经纬度坐标，谷歌采用的是 GCJ-02<br>
	 * GPS ：坐标即 WGS-84 国际标准坐标<br>
	 * GCJ-02 ：中国标准坐标
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.gcj02_To_Wgs84 = function(lng, lat) {
		var point = PointUtils.transform(lng, lat);
		var lngtitude = lng * 2 - point.getLng();
		var latitude = lat * 2 - point.getLat();
		return new PointUtils.Point(lngtitude, latitude);
	}

	/**
	 * GCJ-02 转 BD-09，谷歌采用的是 GCJ-02<br>
	 * GCJ-02 ：中国标准坐标<br>
	 * BD-09：百度在 GCJ-02 坐标基础上加偏移得到了 BD-09
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.gcj02_To_Bd09 = function(lng, lat) {
		var x = lng, y = lat;
		var z = Math.sqrt(x * x + y * y) + 0.00002 * Math.sin(y * x_pi);
		var theta = Math.atan2(y, x) + 0.000003 * Math.cos(x * x_pi);
		var bd_lng = z * Math.cos(theta) + 0.0065;
		var bd_lat = z * Math.sin(theta) + 0.006;
		return new PointUtils.Point(bd_lng, bd_lat);
	}

	/**
	 * BD-09 转 GCJ-02,即百度坐标转中国标准坐标 ==（百度坐标 转 谷歌坐标） BD-09：百度在 GCJ-02 坐标基础上加偏移得到了
	 * BD-09 GCJ-02 ：中国标准坐标<br>
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.bd09_To_Gcj02 = function(lng, lat) {
		var x = lng - 0.0065, y = lat - 0.006;
		var z = Math.sqrt(x * x + y * y) - 0.00002 * Math.sin(y * x_pi);// 运来是PI
		// 没有X_pi精度高
		var theta = Math.atan2(y, x) - 0.000003 * Math.cos(x * x_pi);
		var gg_lng = z * Math.cos(theta);
		var gg_lat = z * Math.sin(theta);
		return new PointUtils.Point(gg_lng, gg_lat);
	}

	/**
	 * BD-09 转 WGS-84，即百度坐标转国际坐标（WGS-84 == GPS）
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.bd09_To_Wgs84 = function(lng, lat) {
		// 1.BD-09 转 GCJ-02
		var gcj02 = PointUtils.bd09_To_Gcj02(lng, lat);
		// 2.GCJ-02 转 WGS-84
		return PointUtils.gcj02_To_Wgs84(gcj02.getLng(), gcj02.getLat());
	}

	PointUtils.outOfChina = function(lng, lat) {
		if (lng < 72.004 || lng > 137.8347)
			return true;
		if (lat < 0.8293 || lat > 55.8271)
			return true;
		return false;
	}

	PointUtils.transform = function(lng, lat) {
		if (PointUtils.outOfChina(lng, lat)) {
			return new PointUtils.Point(lng, lat);
		}
		var dLat = PointUtils.transformLat(lng - 105.0, lat - 35.0);
		var dLng = PointUtils.transformLng(lng - 105.0, lat - 35.0);
		var radLat = lat / 180.0 * pi;
		var magic = Math.sin(radLat);
		magic = 1 - ee * magic * magic;
		var sqrtMagic = Math.sqrt(magic);
		dLat = (dLat * 180.0) / ((a * (1 - ee)) / (magic * sqrtMagic) * pi);
		dLng = (dLng * 180.0) / (a / sqrtMagic * Math.cos(radLat) * pi);
		var mgLat = lat + dLat;
		var mgLng = lng + dLng;
		return new PointUtils.Point(mgLng, mgLat);
	}

	PointUtils.transformLat = function(x, y) {
		var ret = -100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2
				* Math.sqrt(Math.abs(x));
		ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
		ret += (20.0 * Math.sin(y * pi) + 40.0 * Math.sin(y / 3.0 * pi)) * 2.0 / 3.0;
		ret += (160.0 * Math.sin(y / 12.0 * pi) + 320 * Math.sin(y * pi / 30.0)) * 2.0 / 3.0;
		return ret;
	}

	PointUtils.transformLng = function(x, y) {
		var ret = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1
				* Math.sqrt(Math.abs(x));
		ret += (20.0 * Math.sin(6.0 * x * pi) + 20.0 * Math.sin(2.0 * x * pi)) * 2.0 / 3.0;
		ret += (20.0 * Math.sin(x * pi) + 40.0 * Math.sin(x / 3.0 * pi)) * 2.0 / 3.0;
		ret += (150.0 * Math.sin(x / 12.0 * pi) + 300.0 * Math.sin(x / 30.0
				* pi)) * 2.0 / 3.0;
		return ret;
	}

	/**
	 * 图吧 转 WGS-84（国际坐标）
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.tuba_To_Wgs84 = function(lng, lat) {
		lng = lng * 100000 % 36000000;
		lat = lat * 100000 % 36000000;
		var x1 = (-(((Math.cos(lat / 100000)) * (lng / 18000)) + ((Math
				.sin(lng / 100000)) * (lat / 9000))) + lng);
		var y1 = (-(((Math.sin(lat / 100000)) * (lng / 18000)) + ((Math
				.cos(lng / 100000)) * (lat / 9000))) + lat);
		var x2 = (-(((Math.cos(y1 / 100000)) * (x1 / 18000)) + ((Math
				.sin(x1 / 100000)) * (y1 / 9000)))
				+ lng + ((lng > 0) ? 1 : -1));
		var y2 = (-(((Math.sin(y1 / 100000)) * (x1 / 18000)) + ((Math
				.cos(x1 / 100000)) * (y1 / 9000)))
				+ lat + ((lat > 0) ? 1 : -1));
		return new PointUtils.Point(x2 / 100000.0, y2 / 100000.0);
	}

	/**
	 * WGS-84（国际坐标） 转 图吧
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.wgs84_To_Tuba = function(lng, lat) {
		lng = lng * 100000 % 36000000;
		lat = lat * 100000 % 36000000;
		var _X = (((Math.cos(lat / 100000)) * (lng / 18000))
				+ ((Math.sin(lng / 100000)) * (lat / 9000)) + lng);
		var _Y = (((Math.sin(lat / 100000)) * (lng / 18000))
				+ ((Math.cos(lng / 100000)) * (lat / 9000)) + lat);
		return new PointUtils.Point(_X / 100000.0, _Y / 100000.0);
	}

	/**
	 * WGS-84（国际坐标） 转 BD09（百度坐标）
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.wgs84_To_Bd09 = function(lng, lat) {
		var gcj02 = PointUtils.wgs84_To_Gcj02(lng, lat);
		return PointUtils.gcj02_To_Bd09(gcj02.getLng(), gcj02.getLat());
	}

	/**
	 * 图吧 转 GCJ-02（Google 坐标）
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.tuba_To_Gcj02 = function(lng, lat) {
		var wgs84 = PointUtils.tuba_To_Wgs84(lng, lat);
		return PointUtils.wgs84_To_Gcj02(wgs84.getLng(), wgs84.getLat());
	}

	/**
	 * 百度坐标 转 图吧
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.baidu_To_Tuba = function(lng, lat) {
		var wgs84 = PointUtils.bd09_To_Wgs84(parseFloat(lng), parseFloat(lat));
		return PointUtils.wgs84_To_Tuba(wgs84.getLng(), wgs84.getLat());
	}

	/**
	 * 百度（BD09）转 Google（GCJ-02）
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.baidu_To_Google = function(lng, lat) {
		return PointUtils.bd09_To_Gcj02(parseFloat(lng), parseFloat(lat));
	}

	/**
	 * 百度（BD09） 转 GPS（WGS-84）
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.baidu_To_Gps = function(lng, lat) {
		return PointUtils.bd09_To_Wgs84(parseFloat(lng), parseFloat(lat));
	}

	/**
	 * 图吧 转 百度坐标
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.tuba_To_Baidu = function(lng, lat) {
		// 1. 图吧 转 GPS（WGS-84）
		var wgs84 = PointUtils.tuba_To_Wgs84(parseFloat(lng), parseFloat(lat));
		// 2. GPS ( WGS-84 ) 转 百度（BD-09）
		return PointUtils.wgs84_To_Bd09(wgs84.getLng(), wgs84.getLat());
	}

	/**
	 * 图吧 转 Google 坐标
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.tuba_To_Google = function(lng, lat) {
		return PointUtils.tuba_To_Gcj02(parseFloat(lng), parseFloat(lat));
	}

	/**
	 * 图吧 转 GPS（WGS-84）
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.tuba_To_Gps = function(lng, lat) {
		return PointUtils.tuba_To_Wgs84(parseFloat(lng), parseFloat(lat));
	}

	/**
	 * Google 转 图吧
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.google_To_Tuba = function(lng, lat) {
		var wgs84 = PointUtils.gcj02_To_Wgs84(parseFloat(lng), parseFloat(lat));
		return PointUtils.wgs84_To_Tuba(wgs84.getLng(), wgs84.getLat());
	}

	/**
	 * Google（GCJ-02） 转 百度（BD09）
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.google_To_Baidu = function(lng, lat) {
		return PointUtils.gcj02_To_Bd09(parseFloat(lng), parseFloat(lat));
	}

	/**
	 * Google（GCJ-02） 转 GPS（WGS-84）
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.google_To_Gps = function(lng, lat) {
		return PointUtils.gcj02_To_Wgs84(parseFloat(lng), parseFloat(lat));
	}

	/**
	 * GPS（WGS-84） 转 百度（BD09）
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.gps_To_Baidu = function(lng, lat) {
		return PointUtils.wgs84_To_Bd09(parseFloat(lng), parseFloat(lat));
	}

	/**
	 * GPS（WGS-84） 转 Google（GCJ-02）
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.gps_To_Google = function(lng, lat) {
		return PointUtils.wgs84_To_Gcj02(parseFloat(lng), parseFloat(lat));
	}

	/**
	 * GPS（WGS-84） 转 图吧
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @return
	 */
	PointUtils.gps_To_Tuba = function(lng, lat) {
		return PointUtils.wgs84_To_Tuba(parseFloat(lng), parseFloat(lat));
	}

	/**
	 * 把待转换类型 转换为 目标类型
	 * 
	 * @param lng
	 *            经度
	 * @param lat
	 *            纬度
	 * @param targetPointType
	 *            目标类型
	 * @param pointType
	 *            待转换类型
	 * @returns Utils.PointUtils.Point()
	 */
	PointUtils.convertPoint = function(lng, lat, targetPointType, pointType) {
		var point = null;
		switch (pointType) {
			case "gps":
				switch (targetPointType) {
					case "baidu":
						point = Utils.PointUtils.gps_To_Baidu(lng, lat);
						break;
					case "google":
						point = Utils.PointUtils.gps_To_Google(lng, lat);
						break;
					case "tuba":
						point = Utils.PointUtils.gps_To_Tuba(lng, lat);
						break;
				}
				break;
			case "baidu":
				switch (targetPointType) {
					case "gps":
						point = Utils.PointUtils.baidu_To_Gps(lng, lat);
						break;
					case "google":
						point = Utils.PointUtils.baidu_To_Google(lng, lat);
						break;
					case "tuba":
						point = Utils.PointUtils.baidu_To_Tuba(lng, lat);
						break;
				}
				break;
			case "google":
				switch (targetPointType) {
					case "gps":
						point = Utils.PointUtils.google_To_Gps(lng, lat);
						break;
					case "baidu":
						point = Utils.PointUtils.google_To_Baidu(lng, lat);
						break;
					case "tuba":
						point = Utils.PointUtils.google_To_Tuba(lng, lat);
						break;
				}
				break;
			case "tuba":
				switch (targetPointType) {
					case "gps":
						point = Utils.PointUtils.tuba_To_Gps(lng, lat);
						break;
					case "baidu":
						point = Utils.PointUtils.tuba_To_Baidu(lng, lat);
						break;
					case "google":
						point = Utils.PointUtils.tuba_To_Google(lng, lat);
						break;
				}
				break;
		}
		if(point == null){
			point = new Utils.PointUtils.Point(lng,lat);
		}
		return point;
	}

})();

/**
 * 地图工具类
 */
(function() {
	var baiduAk = "Zvt09wAOQcdH95F8I9hwQZ6sniTwzGOw";
	var coordToAddressUrl = "http://api.map.baidu.com/geocoder/v2/";
	var addressToCoorUrl = "http://api.map.baidu.com/geocoder/v2/";
	var MapUtils =
	/**
	 * MapUtils 类，静态类，勿需实例化即可使用
	 * 
	 * @class MapUtils类的<b>入口</b>。 该类提供的都是静态方法，勿需实例化即可使用。
	 */
	Utils.MapUtils = function() {
	}

	/**
	 * 根据经纬度获取地址 数据格式：{pointType:"gps",lng:"116.43213",lat:"38.76623"}
	 * 
	 * @param data
	 * @param callback
	 *            回调函数
	 */
	MapUtils.getCoordToAddress = function(data, callback) {
		var isClass = Utils.ObjectUtils.getClass(data);
		if (isClass == "Object") {
			var ajaxData = {
				ak : baiduAk,
				output : "json", // 输出格式为json或者xml
				coordtype : "wgs84ll", // 1,bd09ll（百度经纬度坐标）、2,bd09mc（百度米制坐标）、3,gcj02ll（国测局经纬度坐标）、4,wgs84ll（
										// GPS经纬度）
				location : "38.76623,116.43213", // 根据经纬度坐标获取地址
				pois : 0
			// 是
			};
			ajaxData.location = data.lat + "," + data.lng;
			switch (data.pointType) {
			case "gps":
				ajaxData.coordtype = "wgs84ll"; // wgs84ll（ GPS经纬度）
				break;
			case "baidu":
				ajaxData.coordtype = "bd09ll"; // bd09ll（百度经纬度坐标）
				break;
			case "google":
				ajaxData.coordtype = "gcj02ll"; // gcj02ll（国测局经纬度坐标）
				break;
			case "tuba":
				ajaxData.coordtype = "wgs84ll"; // wgs84ll（ GPS经纬度）
				var point = Utils.PointUtils.tuba_To_Gps(data.lng, data.lat);
				ajaxData.location = point.getLat() + "," + point.getLng();
				break;
			default:
				ajaxData.coordtype = "wgs84ll"; // wgs84ll（ GPS经纬度）
				break;
			}
			Utils.AjaxUtils.Ajax("POST", coordToAddressUrl, "jsonp", ajaxData,
					function(xr) {
						callback(xr.result);
					}
			);
		} else {
			console
					.error('格式错误，必要格式：{pointType:"gps",lng:"116.43213",lat:"38.76623"}');
		}
	}

	/**
	 * 根据地址获取坐标
	 * @param address 地址
	 * @param callback 回调函数
	 */
	MapUtils.getAddressToCoord = function(address,callback){
		var ajaxData = {
				ak : baiduAk,
				output : "json", // 输出格式为json或者xml
				address:address
			};
		Utils.AjaxUtils.Ajax("POST", addressToCoorUrl, "jsonp", ajaxData,
				function(xr) {
					callback(xr);
				}
		);
	}
	
	
	var mapBaiduBoundary = null;
	/**
	 * 创建行政区域搜索的对象实例。
	 * 
	 * @param name
	 *            查询省、直辖市、地级市、或县的名称。
	 * @param callback
	 *            回调函数,返回数据边界点
	 */
	MapUtils.boundary = function(name, callback) {
		if (mapBaiduBoundary == null) {
			mapBaiduBoundary = new BMap.Boundary();
		}
		mapBaiduBoundary.get(name, function(rs) { // 获取行政区域
			callback(rs.boundaries);
		});
	}

	/**
	 * 获取西南脚点，东北脚点，中心点 数据格式：[{lng:"",lat:""},{lng:"",lat:""}]
	 * 
	 * @param points
	 *            边界点
	 * @param name
	 *            地图名称
	 */
	MapUtils.getSwNeCenterPoint = function(points, name) {
		var pps = [];
		for (var i = 0; i < $(points).size(); i++) {
			var point = null;
			if (name == "gps") {
				point = Utils.PointUtils.gps_To_Baidu(points[i].lng,
						points[i].lat);
			} else if (name == "google") {
				point = Utils.PointUtils.google_To_Baidu(points[i].lng,
						points[i].lat);
			} else if (name == "tuba") {
				point = Utils.PointUtils.tuba_To_Baidu(points[i].lng,
						points[i].lat);
			}
			if (name == "baidu") {
				pps.push(new BMap.Point(points[i].lng, points[i].lat));
			} else {
				pps.push(new BMap.Point(point.getLng(), point.getLat()));
			}
		}
		var polygon = new BMap.Polygon(pps);
		var bounds = polygon.getBounds();
		var sw = bounds.getSouthWest(); // 西南脚点
		var ne = bounds.getNorthEast(); // 东北脚点
		var center = bounds.getCenter(); // 中心点

		var rdata = {
			sw : {
				lng : 0,
				lat : 0
			},
			ne : {
				lng : 0,
				lat : 0
			},
			center : {
				lng : 0,
				lat : 0
			}
		};

		var swPoint = null;
		var nePoint = null;
		var centerPoint = null;
		if (name == "gps") {
			// 西南脚点
			swPoint = Utils.PointUtils.baidu_To_Gps(sw.lng, sw.lat);
			// 东北脚点
			nePoint = Utils.PointUtils.baidu_To_Gps(ne.lng, ne.lat);
			// 中心点
			centerPoint = Utils.PointUtils.baidu_To_Gps(center.lng, center.lat);
		} else if (name == "google") {
			// 西南脚点
			swPoint = Utils.PointUtils.baidu_To_Google(sw.lng, sw.lat);
			// 东北脚点
			nePoint = Utils.PointUtils.baidu_To_Google(ne.lng, ne.lat);
			// 中心点
			centerPoint = Utils.PointUtils.baidu_To_Google(center.lng,
					center.lat);
		} else if (name == "tuba") {
			// 西南脚点
			swPoint = Utils.PointUtils.baidu_To_Tuba(sw.lng, sw.lat);
			// 东北脚点
			nePoint = Utils.PointUtils.baidu_To_Tuba(ne.lng, ne.lat);
			// 中心点
			centerPoint = Utils.PointUtils.baidu_To_Tuba(center.lng, center.lat);
		}

		if (name == "baidu") {
			// 西南
			rdata.sw.lng = sw.lng;
			rdata.sw.lat = sw.lat;
			// 东北
			rdata.ne.lng = ne.lng;
			rdata.ne.lat = ne.lat;
			// 中心点
			rdata.center.lng = center.lng;
			rdata.center.lat = center.lat;
		} else {
			// 西南
			rdata.sw.lng = swPoint.getLng();
			rdata.sw.lat = swPoint.getLat();
			// 东北
			rdata.ne.lng = nePoint.getLng();
			rdata.ne.lat = nePoint.getLat();
			// 中心点
			rdata.center.lng = centerPoint.getLng();
			rdata.center.lat = centerPoint.getLat();
		}
		return rdata;
	}

})();

/**
 * ajax
 */
(function() {
	var AjaxUtils = Utils.AjaxUtils = function() {
	}
	/**
	 * ajax 请求
	 * 
	 * @param type
	 *            请求方式. POST 、GET
	 * @param url
	 *            请求地址
	 * @param dataType
	 *            返回数据类型, jsonp/xml
	 * @param data
	 *            请求附加数据，格式：{}
	 * @param callback
	 *            回调函数
	 */
	AjaxUtils.Ajax = function(type, url, dataType, data, callback) {
		$.ajax({
			type : type,
			url : url,
			dataType : dataType,
			data : data,
			success : callback,
			error : callback
		});
	}
})();

/**
 * 网页工具类
 */
(function() {
	var WebUtils = Utils.WebUtils = function() {
	}
	/**
	 * 滚动
	 * 
	 * @param top
	 *            滚动距离：200
	 */
	WebUtils.ScrollTop = function(top) {
		$("html,body").animate({
			scrollTop : top
		}, 300);
	}

	/**
	 * 获取随机颜色
	 */
	WebUtils.getRandomColor = function(){
		return (function(m,s,c){
			return (c ? arguments.callee(m,s,c-1) : '#') +
				s[m.floor(m.random() * 16)]
		})(Math,'0123456789abcdef',5);
	}
})();
