/**
 * 必须实例化
 * @description 控件工具类，所有的控件都放在 Tools 下
 * 
 */
var Tools = window.Tools = Tools || {};
(function($){
	/**
	 * @description  Table 控件的默认参数
	 */
	var TableDefaults = {
		launch: true,	//实例化时启动。true：是（默认值），false：否 
		shade: {	//遮罩层设置
			enabled: true	//是否启用遮罩。true：是（默认值），false：否
		},	
		id : null, // 容器ID
		data : {total : 0, data : []}, // 数据。total : 总条数, data：数据
		total : 0, // 总条数
		page : 0, // 当前页
		pageSpan : 5,	//点击 ... 时的跨度最大页码，从当前页+5
		pageSize : 10, // 每页显示几条，默认 10
		countPage : 0, // 总页码
		/**
		 * 风格设置
		 */
		style: {
			tableClass: ''		//table 的 class 样式名称
		},
		/**
		 * true: 可编辑
		 * false: 不可编辑
		 */
		enableEdit: false,	//table td 可编辑行
		columns : [],	//字段集合
		/**
		 * 思路：
		 * 缓存已经加载过的页数据。如加载了1,5页，下次再次点击1,5页就不在向服务器发送请求了。
		 */
		cache: true,	//缓存上下页的请求数据。true：是（默认），false：否
		/**
		 * 思路：
		 * 
		 */
		sequence : true, // 连续显示序号。true：是(默认)，false：否
		/**
		 * 思路：
		 * true：all-取出所有数据模式。在上一页，下一页的时候不请求服务器，只遍历当前的数据。
		 * false：single-分页取数据模式。在上一页，下一页的时候，需要请求服务器，然后在返回数据，并显示。
		 */
		mode: true,	//数据模式。
		request : { // 请求数据
			url : "",	//请求路径
			type : "GET",	//请求类型。POST|GET|PUT|DELETE
			jsonp: 'callback',	//跨域，默认回调函数。
			dataType: "json",	//服务器数据返回类型，xml|html|script|json|jsonp|text
			headers:{},//请求头
			data:{},	//	请求数据。
			/**
			 * 思路：
			 * 一）launch = true 时，创建 Table 时向服务器请求数据。
			 * mode（模式）影响因素
			 * 1.mode = true（取出所有数据模式） 只会请求一次服务器。
			 * 2.mode = false （分页取数据模式）请求 N 次服务器。
			 * 二）launch = false，创建 Table 时不会向服务器请求数据。
			 * 只能通过以下方式设置数据。
			 * 1.在实例化时，在参数中传递 Table 的数据
			 * 2.通过 .setData(); 设置数据。
			 * mode（模式）影响因素。
			 * mode = true ,在上一页，下一页的时候不请求服务器，只遍历当前的数据。
			 * mode = false ,在上一页，下一页的时候，等待外部请求并返回数据数据。
			 */
			launch : false	,//请求数据。true：是，false：否。
			exception: function(){},	//异常执行的调用方法
			status: true	//请求状态。true：成功，false：失败
		},
		/**
		 * 当mode=false，reqeust.launch=false,则调用这个方法，并传递3个参数
		 * headers 请求头，如有此设置
		 * paramsData 请求数据，如由此设置
		 * callback:function(resultData){...}回调函数
		 */
		externalRequest:null,	//外部请求。
		rowClick:function(){},//行的点击事件。参数,arg0：当前行的数据，arg1：整个 Table 的数据
		rowDblclick:function(){},	//行双击事件。参数,arg0：当前行的数据，arg1：整个 Table 的数据
		initComplete : function() {},//初始化完成时调用。参数,arg0：整个 Table 的数据
		requestComplete:function(){},	//每次请求完成时调用。参数,arg0：整个 Table 的数据
		checkAll:function(){}	//全选点击事件。参数 arg0 :被选中行的数据，arg1整个Table的数据
	};
	
	
	/**
	 * @description 单个 column 的默认参数
	 */
	var TableColumnDefault = {
		id : null,		//列的ID。如：userName
		display : "",	//列的名称。如：用户名（一般显示在 Table 的 thead，标题栏）
		isDisplay : true,	//是否显示 dispaly 列的名称。
		width : "auto",	//列的宽。auto ，自动列宽。
		async : 'true',  // true：异步请求, false：同步请求
		/**
		 * no: 序号
		 * operationCheckbox: 复选框（限于全选用）
		 * operationRadio: 单选框（限于操作用）
		 * text: 文本类型
		 * checkbox: 复选框
		 * radio: 单选框
		 * select: 下拉
		 */
		type : 'text', // 类型。默认 : Text
		readonly:false,	//只读
		disabled:false,	//禁用
		position: 'left',	//默认左边。当 type 为 checkbox|radio|select 时，显示在列名的左边还是右边。
		/**
		 * 当 type = checkbox, radio,select 类型，
		 * isShowInput = true, 在Table Thead th 中显示，否则不显示。
		 */
		isShowInput: true,	//是否显示在 Table Thead th中。
		thInputValues: null,	//展示没用(***)
		/**
		 * 格式: [{display: "重庆",value: "1001"},{display: "北京",value: "1002"}]
		 * 	display 的值显示在 input 标签的后面，value 的值设置到 input 的 value 属性里
		 */
		data: [],	//单选,复选框,下拉的数据。
		/**
		 * center(居中)、默认值
		 * left(居左),
		 * right(靠右)
		 */
		textAlign : 'center', //单元格内容对齐方式。
		thTextAlign : null,		//thead th 标题内容对其方式，默认以 textAlign 的设置。
		tdTextAlign : 'left',		//tbody td 内容对其方式，默认以 textAlign 的设置。
		/**
		 * 思路：当 render 不为 null 并且 render 为 function 时，以 render 返回值为准 
		 */
		render: null,		//自定义返回值。
	};
	
	/**
	 * 字段类型限制
	 */
	var TableColumnTypes = ['operationRadio','operationCheckbox','no','text','checkbox','radio','select'];
	/**
	 * 字段类型正则表达式
	 */
	var TableColumnTypesRegExp = /^(operationRadio)$|^(operationCheckbox)$|^(no)$|^(text)$|^(checkbox)$|^(radio)$|^(select)$/g;
	
	/**
	 * @Class 必须实例化，才能使用。
	 * @description Table 表格控件
	 * @Param {Object} p_params	控件参数
	 */
	var Table = Tools.Table = function(p_params){
		var $this = this;
		this.$random = parseInt(Math.random() * 999999999999);	//随机数
		this.$container = null;		//父容器
		this.$body = null;				//主体
		this.$shade = null;			//遮罩
		this.$table = null;				//table
		this.$thead = null;			//table thead
		this.$tbody = null;			//table tbody
		this.$pageinfo = null;		//分页信息
		this.columns = null;		//字段集合
		this.params = null;		//参数设置
		this.data = new Array();		//数据
		this.checkeds = new Object(); //存放那些页的全选是被选中的
		this.caches = new Object(); //存放缓存的页码
		this.init(p_params);		//初始化
	}
	
	/**
	 * @description 初始化 table 控件
	 * @param {Object} p_params	控件参数
	 */
	Table.prototype.init = function(p_params){
		if(typeof p_params == "undefined"){
			console.error("Tools.Table.init(p_params)  请设置基本的初始化数据。");
			return;
		}
		if(!(p_params instanceof Object)){
			console.error("Tools.Table.init(p_params) 参数必须是 Object 类型。");
			return;
		}
		//合并 TableDefaults 和 p_params 对象，并且不修改 TableDefaults 对象。
		//如果是true，合并成为递归（又叫做深拷贝）。
		this.params = $.extend(true, TableDefaults, p_params);
		
		//判断是否设置了容器ID
		if (this.params.id == null) {
			console.error("Tools.Table.init ... 请设置容器id。");
			console.error("示例：var table = new Tools.Table({id:'deviceTable' ...})");
			return;
		}
		
		//验证数据
		if(typeof this.params.data != "undefined"){
			if(!this.validData(this.params.data,"Tools.Table.init(p_params.data) ... 参数传递错误")){
				return;
			}
		}
		
		//判断是否有字段集合
		if(this.params.columns == null || this.params.columns.length <= 0 ){
			console.error("Tools.Table.init ...  p_params.columns 中至少有 1 个显示的字段。");
			console.error("示例：var table = new Tools.Table({columns: [{name: 'userName',type: 'text' ...}]})");
			return;
		}
		
		//验证 this.params.pageSpan 为数字，并且大于0
		if(typeof this.params.pageSpan != "number" || this.params.pageSpan <= 0){
			console.info("Tools.Table.init ... p_params.pageSpan 设置错误,必须 > 0，【pageSpan = "+this.params.pageSpan+"】");
			console.info("已默认设置为：5 ");			
			this.params.pageSpan = 5;
		}
		
		//数据
		this.data = this.params.data;
		
		// 合并 columns 参数设置
		var mcSign = this.mergeColumns(this.params.columns);
		if(!mcSign){
			return;
		}
		
		//初始化完成时执行
		this.params.initComplete();
		
		//创建 table
		//this.params.launch = true, 实例化时则,开始初始化容器
		if(this.params.launch){
			this.initContainer();
		}
	}
	
	/**
	 * @description 合并 columns 参数设置
	 * @param {Object} p_columns	字段集合
	 * @return true|false
	 */
	Table.prototype.mergeColumns = function(p_columns) {
		this.columns = null;
		this.columns = new Array();
		for (var i = 0; i < p_columns.length; i++) {
			//合并,必须进行深度复制，不然他们的引用都是一样。(?????)
//			this.columns[i]=Utils.Object.deepClone($.extend({}, TableColumnDefault,p_columns[i]));
			this.columns.push($.extend({}, TableColumnDefault,p_columns[i]));
			//格式判断
			//1.判断，id 是否存在
			if(this.columns[i].id == null || this.columns.id == ""){
				console.error("Tools.Table.mergeColumns(p_columns) 每个字段必须定义 id 并且 id 值唯一。");
				console.error("示例：[{id:'userName' ...}]");
				return false;
			}
			//2.判断类型是否符合
			if(!(/^(operationRadio)$|^(operationCheckbox)$|^(no)$|^(text)$|^(checkbox)$|^(radio)$|^(select)$/g.test(this.columns[i].type))){
				console.error("Tools.Table.mergeColumns(p_columns) 【type: "+this.columns[i].type+"】字段类型不符合。");
				console.error("只能是："+TableColumnTypes.toString());
				console.error("示例：[{id:'userName',type:'text' ...}]");
				return false;
			}
		}
		return true;
	}
	
	/**
	 * @description 启动 Table
	 * @param {Object} p_data 数据，格式：{total:101, data:[]} 可选
	 */
	Table.prototype.launch = function(p_data){
		if(typeof p_data != "undefined"){
			if(!this.validData(p_data,"Tools.Table.launch(data) ... 参数传递错误")){
				return;
			}
		}
		//初始化
		this.initContainer(p_data);
	}
	/**
	 * @description 验证 data 数据格式
	 * @param {Object} p_data 数据，格式：{total:101, data:[]}
	 * @param {String} p_msg 消息
	 */
	Table.prototype.validData = function(p_data,p_msg){
		if(!(p_data instanceof Object) || (typeof p_data.total == "undefined") || (typeof p_data.total != "number") ||
			(typeof p_data.data == "undefined") || !(p_data.data instanceof Array)){
			console.error(p_msg+"，【data="+JSON.stringify(p_data)+"】");
			console.error("当设置了 data 参数时，请注意格式：{Object} data 数据，格式：{total:101, data:[]}");
			return false;
		}
		return true;
	}
	
	/**
	 * @description 初始化容器
	 * @param {Object} p_data 数据，格式：{total:101, data:[]} 可选
	 * 结构：
	 * <div id="">	外层（父）容器层
	 * 		<div class="tools-table-mbody"> 主容器层		
	 * 			<div class="tools-table-shade"></div>		遮罩层
	 * 			<table>		表格
	 * 				<thead></thead>	表格头部
	 * 				<tbody></tbody>	表格内容
	 * 			</table>
	 * 			<div class="tools-table-pageinfo">分页信息</div>
	 * 		</div>
	 * </div>
	 * 执行顺序：
	 * 1，初始化容器
	 * 2，初始化表格头部
	 * 3，初始化表格主体
	 * 4，初始化分页
	 * 5，如果reqeust.launch=true，启动访问
	 */
	Table.prototype.initContainer = function(p_data){
		var $this = this;
		//父容器
		this.$container = null;
		this.$container = $('#'+this.params.id);
		this.$container.empty();
		
		//主体
		var bodyHtml = '<div id="table_mbody_'+this.$random+'" class="tools-table-mbody"></div>';
		//向容器中添加主体
		this.$container.append(bodyHtml);
		this.$body = null;
		this.$body = $("#table_mbody_"+this.$random);
		this.$body.empty();
		
		//判断是否激活遮罩层, false 则隐藏
		var shadeDisplay = "block";
		if(!this.params.shade.enabled){
			shadeDisplay = "none";
		}
		//遮罩
		var shadeHtml = '<div id="table_mbody_shade_'+this.$random+'" style="display:'+shadeDisplay+'" class="tools-table-shade"><div class="shade"></div>';
		shadeHtml += '<div class="hint"><i class="icon-spinner icon-spin icon-2x"></i><span>正在加载请稍等...</span></div></div>';
		//向主体中添加遮罩
		this.$body.append(shadeHtml);
		this.$shade = null;
		this.$shade = $("#table_mbody_shade_"+this.$random);
		
		//向主体中添加 table
		var tableHtml = '<table id="table_mbody_table_'+this.$random+'" ';
		tableHtml += this.params.enableEdit? 'enableEdit="true"':'';
		tableHtml += ' class="tools-table table table-striped '+this.params.style.tableClass+'"></table>';
		this.$body.append(tableHtml);
		this.$table = null;
		this.$table = $("#table_mbody_table_"+this.$random);
		//可编辑表格
		this.$table.empty();
		
		//向 table 中添加 thead,tbody
		var theadHtml =  '<thead id="table_mbody_table_thead_'+this.$random+'" class="tools-table-thead"></thead>';
		var tbodyHtml = '<tbody id="table_mbody_table_tbody_'+this.$random+'" class="tools-table-tbody"></tbody>';
		this.$table.append(theadHtml);
		this.$table.append(tbodyHtml);
		this.$thead = null;
		this.$thead = $("#table_mbody_table_thead_"+this.$random);
		$this.$thead.empty();
		this.$tbody = null;
		this.$tbody = $("#table_mbody_table_tbody_"+this.$random);
		this.$tbody.empty();
		
		//初始化Thead
		var initThead = this.initThead();
		if(!initThead){
			console.error("Tools.Table.initThead()... 初始化失败。");
			return false;
		}
		
		//初始化 pageinfo 分页信息
		//向主体中添加 pageinfo 
		var pageInfoHtml = '<div id="table_mbody_pageinfo_'+this.$random+'" class="tools-table-pageinfo">分页信息</div>';
		this.$body.append(pageInfoHtml);
		this.$pageinfo = null;
		this.$pageinfo = $("#table_mbody_pageinfo_"+this.$random);
		
		//请求数据
		if(this.params.request.launch){
			if(this.params.request.url == "" || null == this.params.request.url){
				console.error("Tools.Table.initContainer() 请设置 url 请求路径。");
				console.error("示例：参数设置：{request:{launch:true,url:'http://www.xxmi.cn/tools/',type:'get',params:{name:'西西米'} } }");
				return false;
			}
			//页码，显示条数
			var  pageData = {page: this.params.page, pageSize: this.params.pageSize};
			//请求参数
			var paramsdata = $.extend({}, this.params.request.data, pageData);
			//请求
			this.request(this.params.request.type,this.params.request.url,this.params.request.headers,paramsdata,
				this.params.request.dataType,this.params.request.jsonp,function(resultData){
					$this.fillContent("first",resultData.result);
				}
			);
		}//通过手动启动
		else{
			/**
			 * 考虑执行顺序
			 * 1.传递的 p_data 数据
			 * 2.
			 * 3.new Table({...}) 时 .data 数据
			 */
			if(typeof p_data != "undefined"){
				this.fillContent("first",p_data);
			}else if(this.params.externalRequest instanceof Function){
				this.externalRequest();
			}else{
				this.fillContent("first",this.params.data);
			}
		}
		this.hideShade();	//隐藏遮罩
	}
	
	/**
	 * arguments.callee();//递归
	 * @description 请求
	 * @param {Object} type 请求类型。get|post|put|delete
	 * @param {Object} url 请求地址|路径
	 * @param {Object} headers 请求头。{键:值}
	 * @param {Object} data 请求数据。{键:值}
	 * @param {Object} dataType 返回数据类型。text|xml|json|jsonp|script
	 * @param {Object} jsonp 跨域请求回调函数名称。
	 * @param {Object} callback 回调函数
	 */
	Table.prototype.request = function(type,url,headers,data,dataType,jsonp,callback){
		var $this = this;
		Utils.Ajax.ajax(type,url,headers,data,dataType,jsonp,function(status,resultData,arg1,arg2,arg3){
					//当 status = success 时，参数依次是："success",resultData,arg1:textStatus,arg2:jqXHR
					if(status == "success"){
						//返回状态
						if(resultData.error == 0 && resultData.success == 0){
							callback(resultData);
						}else{
							callback(null);
							//状态异常，执行外部调用
							$this.params.request.exception(resultData);
						}	
						//每次请求完成时执行
						$this.params.requestComplete(status);
					}//当 status = error 时，返回参数依次是："error",null,arg1:jqXHR, arg2:textStatus,arg3:errorThrown
					else{
						console.error("Tools.Table.initContainer() ... 请求发生异常。");
						console.error(arg1);
						console.error(arg2);
						console.error(arg3);
						console.info("返回数据格式是否正确？是 json ? ,jsonp ?");
					}
				});
	}
	
	/**
	 * @description 初始化 table 的 thead 
	 * 结构：
	 * <tr><th></th>...</tr>
	 */
	Table.prototype.initThead = function(){
		var $this = this;
		//判断是否初始化了容器
		if(this.$container == null){
			console.error("Tools.Table.initThead() 请先初始化容器...");
			return false;
		}
		
		var theadHtml = '<tr>';
		var column = null;
		var inputHtml = null;
		var text = null;
		for(var i=0;i<this.columns.length;i++){
			inputHtml = '';
			column = this.columns[i];
			theadHtml +='<th data-column-no="'+i+'" style="width: '+column.width+';';
			theadHtml +='text-align: ';
			//th 内容对齐方式
			if(column.thTextAlign != null){
				theadHtml += column.thTextAlign;
			}else{
				theadHtml += column.textAlign;
			}
			theadHtml +=';">';
			
			//true 时才，显示 checkbox
			if(column.isShowInput){
				switch (column.type){	
					case "operationCheckbox":	//操作用-复选框
						inputHtml = '<input type="checkbox">';
						break;
					case "operationRadio":			//操作用-单选框
						inputHtml = '<input type="radio">';
					break;
				}
			}
			//显示文本 
			if(column.isDisplay){
				if(column.position == 'left'){
					theadHtml += inputHtml+column.display;
				}else{
					theadHtml += column.display+inputHtml;
				}
			//不显示文本，如有 input 则显示 input
			}else{
				theadHtml += inputHtml;
			}
			theadHtml +='</th>';
		}
		theadHtml += '</tr>';
		this.$thead.empty().append(theadHtml);
		
		//添加事件
		this.$thead.find("input[type='checkbox']").off('click').on('click',function(){
			var checked = $(this).prop("checked");
			var columnNo = $(this).parent().attr("data-column-no");
			$this.allChecked(checked,columnNo);
		});
		return true;
	}
	
	/**
	 * @description 全选选中|取消
	 * @param {Boolean} p_checked true:选中，false：取消
	 * @param {Number} p_columnNo 列序号
	 */
	Table.prototype.allChecked = function(p_checked,p_columnNo){
		var i = this.params.page*this.params.pageSize;
		var max = (this.params.page+1)*this.params.pageSize;
		if(max > this.params.total){
			max = this.params.total;
		}
		for(i;i<max;i++){
			this.$tbody.find("> tr[data-row-no="+i+"]").find("> td")
				.eq(p_columnNo).find("input[type='checkbox']")
				.prop("checked",(p_checked?true:false));
		}
		this.checkeds['page'+this.params.page] = p_checked;
	}
	
	/**
	 * @description 向 Tbody 填充内容
	 * @param {String} p_sign ,标记，first|n
	 * @param {Object} p_data 数据，格式：{total:101, data:[]}
	 */
	Table.prototype.fillContent = function(p_sign,p_data){
		if(p_data == null){
			this.data = [];
			this.params.total = 0;//总条数
			this.pageinfo();
			return;
		}
		//全部模式
		if(this.params.mode){
			this.data = null;	
			this.data = p_data.data;
			this.$tbody.empty();
		}//分步取模式
		else{
			this.params.total = p_data.total;	//总条数
			//首次
			if(p_sign == "first"){
				this.data = null;
				this.data = p_data.data;
				this.$tbody.empty();
			}else{
				var i=this.params.page*this.params.pageSize;
				var max = (this.params.page+1)*this.params.pageSize;
				if(max > this.params.total){
					max = this.params.total;
				}
				for(var k in p_data.data){
					this.data[i]=p_data.data[k];
					i++;
				}
				
			}
		}
		this.pageinfo();	//生成分页信息
		//true : 全部模式（数据请求模式）
		if(this.params.mode){
			this.eachData();
		}//局部模式，点击上下页时请求服务器
		else{
			//1.开启了缓存？ 
			if(this.params.cache){
				this.caches['page'+this.params.page]=true;	//加入缓存页
			}
			this.eachData();	//遍历数据
		}
	}
	
	/**
	 * @description 遍历数据
	 */
	Table.prototype.eachData = function(){
		var html = "";
		var no = 0;
		var i=0;
		var max = this.data.length;
		if(!this.params.mode){
			i=this.params.page*this.params.pageSize;
			max=(this.params.page+1)*this.params.pageSize;
			if(max>this.params.total){
				max = this.params.total;
			}
		}
		var rowData = null;
		this.$tbody.find("> tr").hide();
		for(i;i<max;i++){
			rowData = this.data[i];
			//判断序号是否需要连续显示
			if(this.params.sequence){
				no = parseInt(i)	+1;
			}else{
				no = no < this.params.pageSize ? no=no+1:1;
			}
			if(this.params.mode){
				var trDisplay = parseInt(i) < this.params.pageSize ? '':'style="display:none;"';
				html += '<tr data-row-no="'+i+'" '+trDisplay+' >';
			}else{
				html += '<tr data-row-no="'+i+'">';				
			}
			//字段
			for(var k in this.columns){
				var column = this.columns[k];
				html += '<td data-column-no="'+k+'" style="width:'+column.width+';';
				html +='text-align: ';
				//td 内容对齐方式
				if(column.tdTextAlign != null){
					html += column.tdTextAlign;
				}else{
					html += column.textAlign;
				}
				html += ';">';
				switch (column.type){
					case "operationCheckbox":	//操作用-复选框
						html+= '<input type="checkbox">';
						break;
					case "operationRadio": 			//操作用-单选框
						html+= '<input type="radio" name="operationRadio_'+k+'">';
						break;
					case "no":
						html+= no;
						break;
					case 'text':
						if(this.params.enableEdit){
							html+='<input type="text" class="text" ';
							html+=column.readonly?'readonly="readonly" ':'';
							html+=column.disabled?'disabled="disabled" ':'';
							html+=' value="'+rowData[column.id]+'">';
						}else{
							html += rowData[column.id];									
						}
						break;
					case 'checkbox':
						var checkboxString = rowData[column.id].toString();
						for(var h in column.data){
							html += '<input  type="checkbox" ';
							html+=column.readonly?'readonly="readonly" ':'';
							html+=column.disabled?'disabled="disabled" ':'';
							html += checkboxString.indexOf(column.data[h].value) != -1 ? 'checked="checked"':'';
							html += ' name="checkbox_'+i+'_'+k+'_'+h+'" value="'+column.data[h].value+'">';
							html += '&nbsp;'+column.data[h].display+'&nbsp;&nbsp;';
						}
						break;
					case 'radio':
						for(var h in column.data){
							html += '<input  type="radio"';
							html+=column.readonly?'readonly="readonly" ':'';
							html+=column.disabled?'disabled="disabled" ':'';
							html += rowData[column.id] == column.data[h].value ? 'checked="checked"':'';
							html += ' name="radio_'+i+'_'+k+'" value="'+column.data[h].value+'">';
							html += '&nbsp;'+column.data[h].display+'&nbsp;&nbsp;';
						}
						break;
					case 'select':
						html+= '<select ';
						html+=column.readonly?'readonly="readonly" ':'';
						html+=column.disabled?'disabled="disabled" ':'';
						html+=' class="select">';
						for(var h in column.data){
							html+= '<option ';
							html+= rowData[column.id] == column.data[h].value ? 'selected="selected"':'';
							html+= ' value="'+column.data[h].value+'">';
							html+=column.data[h].display;
							html+= '</option>';
						}
						html+= '</select>';
						break;
				}
				html += '</td>';
			}
			html += '</tr>';
		}
		//写入tbody
		//单步模式，未开启缓存
		if(!this.params.mode && !this.params.cache){
			this.$tbody.empty().append(html);
		}else{
			this.$tbody.append(html);
		}
	}
	
	
	/**
	 * @description 生成分页信息
	 */
	Table.prototype.pageinfo = function(){
		var $this = this;
		//计算分页信息
		//每页显示条数
		this.params.pageSize = this.params.pageSize <= 0 ? 10:this.params.pageSize;
		//总页码
		this.params.countPage = 0;
		//true : 全部模式（数据请求模式）
		if(this.params.mode){
			this.params.total = this.data.length;
		}
		//总页码
		if(this.params.total <= 0 ){
			this.params.countPage = 0;
		}else{
			//总条数 <,每页显示条数
			if(this.params.total < this.params.pageSize){
				this.params.countPage  = 1;
			}else{
				//计算总页码
				this.params.countPage  = this.params.total % this.params.pageSize > 0 ?
													(parseInt(this.params.total / this.params.pageSize))+1 : 
													parseInt(this.params.total / this.params.pageSize);
			}
		}
		
		//计算只显示当前页的前后2条
		var  i = this.params.page -2 <=0 ? 0: this.params.page-2; 
		var max = this.params.page+3;
		 if(i<=0){
			max = 5;
		 }else if(max-i<5){
			max = max+(this.params.page-i);
		 }
		 if(max >= this.params.countPage ){
			 max = this.params.countPage ;
			 i = this.params.countPage - 5 <=0?0: this.params.countPage - 5 ;
		 }
		//当前页==0或者总条数==0时，禁用
		var upDisable = (this.params.page == 0 || this.params.total <=0 ) ? 'disabled="disabled"' :'';
		//分页信息
		var pageHtml = '<span page="up" '+upDisable+' >上一页</span>';
		 if(i == 1){
			 pageHtml+='<span>1</span>';
		 }else if(i>=2){
			 pageHtml+='<span>1</span>';
			 pageHtml+='<span sign="up">...</span>';
		 }
		 for(i;i< max;i++){
			 if (i == this.params.page) {
			 	pageHtml+='<span class="actvie">'+(i + 1)+'</span>';
			} else {
				pageHtml+='<span >'+(i + 1)+'</span>';
			}
		 }
		 if(max == this.params.countPage -1){
			 pageHtml+='<span >'+this.params.countPage +'</span>';
		 }else if(max < this.params.countPage ){
			 pageHtml+='<span sign="next">...</span>';
			 pageHtml+='<span>'+this.params.countPage +'</span>';
		 }
		 //当前页==总页码或者总条数==0时，禁用
		 var nextDisable = (this.params.page == this.params.countPage-1 || this.params.total <=0 ) ? 'disabled="disabled"' :'';
		 pageHtml+='<span page="next" '+nextDisable+' >下一页</span>';
		  //手动输入页码
		 var inPageDisable = this.params.countPage <=0 ? 'disabled="disabled"' :'';
		 pageHtml+='<input type="text" class="input-page" '+inPageDisable+' placeholder="页码">';
		 pageHtml+='<button class="button-go" '+inPageDisable+'>Go</button>';
		 this.$pageinfo.empty().append(pageHtml);
		 
		 //分页点击事件
		 this.$pageinfo.find("> span[disabled !='disabled']").off("click").on("click",function(){		
		 	//点击上一页,下一页
		 	var action = $(this).attr("page");
		 	if(typeof action != "undefined"){
		 		if(typeof $(this).attr("disabled") == "undefined"){
			 		if(action == "up"){		//上一页
			 			$this.params.page = $this.params.page-1;
			 		}else{	//下一页
			 			$this.params.page = $this.params.page+1;
			 		}
			 		$this.upNextPage(); //上下页
		 		}
		 	}//点击的页码（数字）或者 （...）
		 	else{
		 		//页面显示的 1，那么 this.params.page = 0，以此类推
		 		var pageNumber = $(this).text();
		 		if(pageNumber == "..."){
		 			//标记点击的是up的...还是next的...
		 			var sign = $(this).attr("sign");
		 			//up 的...
		 			if(sign == "up"){
		 				if($this.params.page-$this.params.pageSpan >=0){
		 					$this.params.page = $this.params.page - $this.params.pageSpan;
		 				}else{
		 					$this.params.page = 0;
		 				}
		 				$this.upNextPage(); //上下页
		 			}//next 的 ...
		 			else{
		 				//当前页 < 总页码-1,说明不是最后一页
			 			if($this.params.page < ($this.params.countPage-1)){
				 			if($this.params.page+$this.params.pageSpan < $this.params.countPage){
				 				$this.params.page = $this.params.page+$this.params.pageSpan; 
				 			}else{
				 				$this.params.page = $this.params.countPage-1;
				 			}
				 			$this.upNextPage(); //上下页
			 			}
		 			}
		 			
		 		}//不是点击的当前页才进入
		 		else if(pageNumber != ($this.params.page+1)){
		 			$this.params.page = parseInt(pageNumber)-1;
		 			$this.upNextPage(); //上下页
		 		}
		 	}
		 });
		 //输入页码,回车键跳转
		 this.$pageinfo.find("> input.input-page").off('keydown').on('keydown',function(e){
			if(e.keyCode==13) {
           		$this.pageGo();
     		}	
		 })
		 //输入页码,点击Go跳转
		 this.$pageinfo.find("> button.button-go").off('click').on('click',function(){
           		$this.pageGo();
		 }); 
	}
	
	/**
	 * @description 输入页码跳转
	 */
	Table.prototype.pageGo = function(){
		var inputPage = this.$pageinfo.find("> input.input-page").val().trim();
	 	if(inputPage == ""){
	 		return;
	 	}
	 	//只能输入数字
	 	if(!(/^[1-9]\d*$/g.test(inputPage))){
	 		this.$pageinfo.find("> input.input-page").val("1");
	 		inputPage = 1;
	 	}
	 	inputPage = parseInt(inputPage);
	 	
	 	//输入的页==当前页不做任何操作
	 	if(inputPage == this.params.page+1){
	 		return ;
	 	}
	 	
	 	if(inputPage <= 0){
	 		this.$pageinfo.find("> input.input-page").val("1");
	 		this.params.page = 0;
	 	}else if(inputPage > this.params.countPage){
	 		this.$pageinfo.find("> input.input-page").val(this.params.countPage);
	 		this.params.page = this.params.countPage-1;
	 	}else{
	 		this.params.page = inputPage-1;
	 	}
	 	this.upNextPage(); //上下页
	}
	
	/**
	 * @description 上下页
	 */
	Table.prototype.upNextPage = function(){
		var $this = this;
		//显示遮罩
		if(this.params.shade.enabled){
			this.showShade();
		}
		//全部模式，不需要发送请求
		if(this.params.mode){
			//隐藏所有row显示当前页row并选中全选对应的row
			this.hideShowRowAndSelected(); 
			this.pageinfo();	//生成分页信息
			$this.hideShade();	//隐藏遮罩
		}//局部模式，点击上下页都去请求服务器 
		else{
			//开启了缓存?并且该页已经缓存
			if(this.params.cache && typeof this.caches['page'+this.params.page] != "undefined" ){
				//隐藏所有row显示当前页row并选中全选对应的row
				this.hideShowRowAndSelected(); 
				this.pageinfo();	//生成分页信息
				$this.hideShade();	//隐藏遮罩
				
			}//1.开启了缓存，但该页没有缓存记录
			//2.未开缓存,每次请求都是新的
			else{
				//取消全选按钮的选中状态
				this.$thead.find("input[type=checkbox]").prop("checked",false);
				//判断是否开启了请求
				if(this.params.request.launch){
					//页码，显示条数
					var  pageData = {page: this.params.page, pageSize: this.params.pageSize};
					//请求参数
					var paramsdata = $.extend({}, this.params.request.data, pageData);
					//请求
					this.request(this.params.request.type,this.params.request.url,this.params.request.headers,paramsdata,
						this.params.request.dataType,this.params.request.jsonp,function(resultData){
							$this.fillContent("n",resultData.result);
							$this.hideShade();	//隐藏遮罩
						}
					);
				}//调用外部请求
				else{
					this.externalRequest();
				}
			}
		}
	}
	
	/**
	 * @description 调用外部请求
	 */
	Table.prototype.externalRequest = function(){
		var $this = this;
		if(!(this.params.externalRequest instanceof Function)){
			console.error("Tools.Table({...}) 参数设置错误，请设置 params.externalRequest 为 Function");
			return;
		}
		
		//页码，显示条数
		var  pageData = {page: this.params.page, pageSize: this.params.pageSize};
		//请求参数
		var paramsdata = $.extend({}, this.params.request.data, pageData);
		//传递的回调函数，返回参数的数据格式：{total:101,data:[]}
		this.params.externalRequest(this.params.headers,paramsdata,function(resultData){
			if(!$this.validData(resultData,"Tools.Table.externalRequest(headers,paramsData,function(resultData){...}) resultData 返回数据错误,【resultData="+JSON.stringify(resultData)+"】")){
				return;
			}
			$this.fillContent("n",resultData);
			$this.hideShade();	//隐藏遮罩
		});
	}
	
	/**
	 * @description 隐藏所有row显示当前页row并选中全选对应的row
	 */
	Table.prototype.hideShowRowAndSelected = function(){
		this.$tbody.find("> tr").hide();	//隐藏所有的 tr
		var i = this.params.page*this.params.pageSize;
		var max = (this.params.page+1)*this.params.pageSize;
		
		if(max > this.params.total){
			max = this.params.total;
		}
		for(i;i<max;i++){
			this.$tbody.find("> tr[data-row-no="+i+"]").show();	//显示当前页的 tr
		}
		var incb = this.$thead.find("input[type=checkbox]");
		if(incb.length > 0){
			var columnNo = incb.parent().attr("data-column-no");
			//说明该页还未点击全选的复选框
			if(typeof this.checkeds['page'+this.params.page] == "undefined"){
				incb.prop("checked",false);
			}else{
				if(this.checkeds['page'+this.params.page]){
					incb.prop("checked",true);
					//this.allChecked(true,columnNo);
				}else{
					incb.prop("checked",false);
				}
			}
		}
	}
	
	/**
	 * @description 隐藏遮罩
	 * @param {String} p_immediately 立刻关闭
	 */
	Table.prototype.hideShade = function(p_immediately){
		var second = 500;
		if(typeof p_immediately != "undefined"){
			second = 0;
		}
		var $shade = this.$shade;
		if($shade != null){
			window.setTimeout(function(){
				$shade.hide();
			},second);
		}
	}
	
	/**
	 * @description 显示遮罩
	 */
	Table.prototype.showShade = function(){
		if(this.$shade != null){
			this.$shade.show();
		}
	}
})($);


























