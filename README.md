## 介绍
	
1. template函数有两个参数,第一个是数据,第二个是字符串模板.
2. 字符串模板的格式要求
	1. 要执行的js代码需要写在: <%= 这里 %> . 比如: <%= var a = ""; %>
	2. 从对象里拿的数据写在: ${ 这里 } . 比如: ${obj.name}
3. 如果obj是对象的话,可以直接从对象里拿数据.比如: 
	
	```
		var obj = {name: "李飞"};
		var str = "hello, ${name}";
		var html = template(obj, str);	
		//html 为 "hello,"李飞
	```
4. 如果obj是数组的话,不能直接拿,需要把数组便利才能使用.

## 原理分析

简单来说就是,把js代码写在固定的格式中,用String.replace()方法,获取到js代码的字符串.
然后拼成一个函数格式的字符串.再用new Function()用这个函数字符串生成一个函数,去处理
模板里的字符串并返回

## 知识点

1. String.replace(参数1, 参数2)

	1. 参数1,可以是字符串也可以是正则表达式,如果是正则表示式.并且有全局匹配g的话,会替换所有的匹配项.如果此时参数2是函数,那么有多少个匹配项,函数就会执行杜少次
	2. 参数2,可以是字符串,也可以是回调函数.函数的返回值会替代匹配的字符串.而回调函数的参数是一般有四个.可以用arguments来拿;
		1. 第一个参数是正则匹配到的字符串
		2. 第二个参数是与正则表达式中子表达式相匹配的字符串.也就是正则中的括号()匹配到的字符串.也即是template函数中我们需要拼接的js字符串.
		3. 如果子表达式有2个,则这里是第二个.多个以此类推.如果子表达式没有了.这里是整个被匹配到的字符串所在的length.
		4. 完整的原始字符串;
	3. replace函数不改变源字符串.返回值是替换之后的结果

2. 	new Function(参数1, 参数2, functionBody)

	1. Function函数的最后一个参数functionBody就是函数字符串.这里的字符串会被变成js代码成为函数体
	2. functionBody前面的参数都是最终函数的参数.

3. with语句
	
	```
		var obj = {name: "lifei", age: 18};
		with(obj) {
			var a = name; // "lifei"
			var age = age; // 18
		}
	```
	在with语句中可以用变量直接获取obj对象上的属性.就好像把window换成了obj一样.可以直接访问他的属性.用在template函数中可以让拼接的字符串更加的清晰.但是with语句执行缓慢.慎用.

4. 用来匹配js代码的正则表达式: /<%=\s*([^%>]+)\s*%>/g
	
	1. g: 全局匹配
	2. <%= : 用"<%="开头
	3. \s* : 不定数量的空格
	4. [^%>] : 除了"%>"以外的其他字符
	5. () : 子表达式  

## 详解
	
	因为有Function函数的存在.我们可以拼接一个函数字符串来生成函数.对源字符串进行处理.
	所以我们的主要问题就是用String.replace()拿到模板里的js代码.
	再和源字符串一起拼接成一个函数字符串.再用new Function()生成函数,处理字符串.生成最后的结果.

	比如:
	```
		var str = "<span>name</span>"
		var obj = {name: "李飞"}
	```
	这两个参数我们最后要生成的函数字符串是: 
	```
		"var tmp = \"\"; with(obj){tmp ='<span>name</span>';}return tmp;"
	```

	```
	var template = (function() { 
		var cache = {};
		return function(obj, str) {

			//判断str
			if (!typeof str === "string") {
				return;
			}

			//懒加载
			var compile = cache[str]
			if (!cache[str]) {
				var template = str.replace(/<%=\s*([^%>]+)\s*%>/g, function() {
					
					//arguments拿到正则中([^%>]+)匹配到的,js代码;
					var k = arguments[1]

					//拼接,这里最麻烦
					var tm =  "';" + k  + " tmp+='"
					return tm;
				})

				//因为js的执行代码和从对象中取数据的代码格式不一样.所以要匹配两次.
				.replace(/\$\{\s*([^\}]+)\s*\}/g, function() {
					var k = arguments[1]
					var tm = "' +" + k+ "+'";
					return tm;
				})

				//拼接函数代码
				template = "var tmp = \"\"; with(obj){tmp ='" + template + "';}return tmp;"
				console.log("template")
				//生成函数.
				compile = new Function("obj", template)
			}

			//返回值
			return compile(obj)
		}
	})()

```