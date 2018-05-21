var template = (function() { 
        var cache = {};
        return function(obj, str) {
            if (!typeof str === "string") {
                return;
            }
            var compile = cache[str]
            if (!cache[str]) {
                var template = str.replace(/<%=\s*([^%>]+)\s*%>/g, function() {
                    var k = arguments[1]
                    var tm =  "';" + k  + " tmp+='"
                    console.log("tm", tm)
                    return tm;
                })
                .replace(/\$\{\s*([^\}]+)\s*\}/g, function() {
                    var k = arguments[1]
                    var tm = "' +" + k+ "+'";
                    return tm;
                })
                template = "var tmp = \"\"; with(obj){tmp ='" + template + "';}return tmp;"
                console.log("template", template)
                compile = new Function("obj", template)
            }
            return compile(obj)
        }
    })()