/* */
Cr.fromJsonString = function(jsonString){
	return this.fromJsonObject( JSON.parse(jsonString) );
};

Cr.fromJsonObject = function(jsonObject){
	//Cr.elm(0 is element type, 1 is attributes, 2 is child nodes, 3 is append to)
	for( var i in jsonObject ){
		if(i=='elm'){
			for( var a in jsonObject[i][1] ){
				if(a.substr(0,5)=='event'){
					var events=jsonObject[i][1][a];
					if(typeof(events[0])=='string')events=[events];
					for( var e in events ){
						var fnName=events[e][1];
						if(typeof(fnName)=='string')
							jsonObject[i][1][a][e][1]=this.functionForString(fnName);
					}
				}
			}
			return this.elm(jsonObject[i][0],jsonObject[i][1],this.fromArrayOfJsonObject(jsonObject[i][2])/*,jsonObject[i][3]*/);
		}
		if(i=='txt')
			return this.txt(jsonObject[i][0].replace(/\\n/g,"\n").replace(/\\t/g,"\t"));	
	}
};
Cr.fromArrayOfJsonObject = function(jsonObjectArray){
	var nodesArr=[];
	if(jsonObjectArray){
		for( var a=0,l=jsonObjectArray.length;a<l;a++ ){
			nodesArr.push(this.fromJsonObject(jsonObjectArray[a]));
		}
	}
	return nodesArr;
};
Cr.functionForString = function(fnName){
	//perform test, if suitiable function does not exist for the string name, then
	
	//if(unsafe){
	//return function(){};
	//}
	
	//if safe, and you need to bind...
	//return this.__functionForString(fnName).bind(myInstance);
	
	//default simple handler finds functions relative to window object... 
	//searches within objects.... such that "myObject.myFunction" is a valid fnName to search
	return this.__functionForString(fnName);
};
Cr.__functionForString = function(fnName){
	var fnOut=function(){};
	//certain function base name may be restricted
	// security should be handled in the function 
	//Cr.functionForString = function(fnName){ 
	//which you should over-ride (above) to enforce your own security needs
	//and lock down unacceptable event targets that may exist on the window object.
	var namePart=fnName.split('.');
	if(namePart.length > 0){
		if(window[namePart[0]]){
			fnOut=window[namePart[0]];
		}
		if(namePart.length > 1){
			for( var i=1,l=namePart.length;i<l;i++ ){
				if(fnOut[namePart[i]])
					fnOut=window[namePart[i]];
			}
		}
	}
	if(typeof(fnOut)!='function')fnOut=function(){};
	return fnOut;
};