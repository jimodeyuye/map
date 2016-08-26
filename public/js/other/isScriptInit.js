var src = 'http://api.map.baidu.com/api?v='+defaultConfig.version+'&ak='+defaultConfig.ak;
var headEle = document.getElementsByTagName('head')[0];
var scriptEle = document.createElement('script');
scriptEle.setAttribute('type', 'text/javascript');
scriptEle.setAttribute('src', src);
headEle.appendChild(scriptEle);
/*IE ? */
if (document.all) {
    scriptEle.onreadystatechange = function () {
        if (scriptEle.readyState == 'loaded' || scriptEle.readyState == 'complete') {
            alert('IE6、IE7 support js.onreadystatechange');
        }
    }
}else {
    scriptEle.onload = function () {
        alert("谷歌加载完成!");
    }
}