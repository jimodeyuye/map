
var mgData = [
    {
        car:{//返回的数据格式（）
            vin: "XSFWU2424423DWE",	//车架号
            carName: "长江七号"        //车名
        },
        dataPoint:[ //存放返回来的数据点
            {   lng:106.499673, //经度
                lat:29.579541,   //纬度
                location: "重庆澄溪",   //位置
                speed:"20km/h",     //速度
                electricity: "2A"   //电流
            },
            {   lng:106.543367, //经度
                lat:29.502619,   //纬度
                location: "重庆澄溪",   //位置
                speed:"20km/h",     //速度
                electricity: "2A"   //电流
            },
            {   lng:106.59396, //经度
                lat:29.639831,   //纬度
                location: "重庆澄溪",   //位置
                speed:"20km/h",     //速度
                electricity: "2A"   //电流
            }
        ]
    },
    {
        car:{//返回的数据格式（）
            vin: "XSFWU2424423DWE222",	//车架号
            carName: "长江七号222"        //车名
        },
        dataPoint:[ //存放返回来的数据点
            {   lng:111.884045, //经度
                lat:30.5124,   //纬度
            },
            {   lng:112.242792, //经度
                lat:27.905942,   //纬度
            },
            {   lng:118.58986, //经度
                lat:28.35447,   //纬度
            }
        ]
    }
];
$(function(){
    $("#startMonitoring").click(function () {
        //['XSFWU2424423DWE','XSFWU2424423DWE222']
        bm1.startMonitoring(['XSFWU2424423DWE','XSFWU2424423DWE222'],function () {})
    });

    $("#setMonitoringData").click(function () {
        bm1.setMonitoringData(mgData);
    });

    $("#setMonitoringData2").click(function () {
        bm1.setMonitoringData({
            car:{//返回的数据格式（）
                vin: "XSFWU2424423DWE",	//车架号
                carName: "长江七号"        //车名
            },
            dataPoint:[ //存放返回来的数据点
                {   lng:106.817602, //经度
                    lat:29.506643,   //纬度
                    location: "重庆澄溪",   //位置
                    speed:"20km/h",     //速度
                    electricity: "2A"   //电流
                },
                {   lng:106.726765, //经度
                    lat:29.328951,   //纬度
                    location: "重庆澄溪",   //位置
                    speed:"20km/h",     //速度
                    electricity: "2A"   //电流
                },
                {   lng:106.255334, //经度
                    lat:29.275028,   //纬度
                    location: "重庆澄溪",   //位置
                    speed:"20km/h",     //速度
                    electricity: "2A"   //电流
                }
            ]
        });
    });
});

var bm1 = new Map.Baidu({
    id: "mapContent1",
    monitoring:{
        infoWindowCallback:function (carInfo,callback) {
            callback(null,"<div class='map-dialog'>成功了，信息窗口</div>");
        }
    }
});


