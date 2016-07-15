/* */
if(typeof Cr == 'undefined'){var Cr = {};} // typically this should be included after Cr and it should be defined... this is for node/require
Cr.fromJsonString = function(jsonString){
	return this.fromJson( JSON.parse(jsonString) );
};

//detection function
Cr.fromArray = function(array){
	var jsonObject = array[0]; // possible detection need for each element of array... if mixed format
	if( jsonObject.txt || jsonObject.elm ){
		return this.fromArrayOfJsonObject(array);
	}else{
		return this.fromArryOfSimpleJson(array);
	}
}
Cr.fromJson = function(jsonObject){
	if( jsonObject.txt || jsonObject.elm ){
		return this.fromJsonObject(jsonObject); // keys are functions
	}else{ // simple json format (keys are elements)
		return this.fromSimpleJson(jsonObject);
	}
}

//for mixing JSON and SimpleJSON formats while nesting
Cr.fromJsonMixedFormat = function(){}
Cr.fromArrayOfJsonMixedFormat = function(){}


Cr.fromSimpleJson = function(jsonObject){ // in this format, childNodes is the only way to add child nodes
	for( var node in jsonObject ){
		var contents = jsonObject[node], lev;
		if( node == 'txt' || node == 'text' ){
			return this.txt(contents.replace(/\\n/g,"\n").replace(/\\t/g,"\t"));
		}else{
			if( lev=(contents.event || contents.events) ){
				this.__extractEvents(lev);
			}
			if( contents.childNodes ){
				contents.childNodes = this.fromArryOfSimpleJson(contents.childNodes);
			}
			return this.elm(node, contents);
		}
	}
};

Cr.fromArryOfSimpleJson = function(jsonObjectArray){
	var nodesArr=[];
	if(jsonObjectArray){
		for( var a=0,l=jsonObjectArray.length;a<l;a++ ){
			nodesArr.push(this.fromSimpleJson(jsonObjectArray[a]));
		}
	}
	return nodesArr;
};
Cr.fromJsonObject = function(jsonObject){
	//Cr.elm(0 is element type, 1 is attributes, 2 is child nodes, 3 is append to)
	for( var i in jsonObject ){
		if(i=='elm'){
			for( var a in jsonObject[i][1] ){
				if(a.substr(0,5)=='event'){
					this.__extractEvents(jsonObject[i][1][a]);
				}else if(a=='childNodes'){
					jsonObject[i][1][a] = this.fromArrayOfJsonObject(jsonObject[i][1][a]);
					jsonObject[i][2] = false;
				}
			}
			return this.elm(jsonObject[i][0],jsonObject[i][1],jsonObject[i][2]?this.fromArrayOfJsonObject(jsonObject[i][2]):false/*,jsonObject[i][3]*/);
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
Cr.__extractEvents = function(events){
	if(typeof(events[0])=='string')events=[events];
	if(events.length) for( var e in events ){
		var fnName=events[e][1];
		if(typeof(fnName)=='string')
			events[e][1]=this.functionForString(fnName);
	}else for( var e in events ){
		if(typeof(e)=='string' && typeof(events[e])=='string'){
			events[e]=this.functionForString(events[e]);
		}
	}
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
		// TODO: window is not defined when calling this server side, which means it basically does not work in nodejs env
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
// more node.js stuff, delete this line if serving on the web
if( typeof(module) != 'undefined' ) module.exports = function(RealCr){for(var p in Cr){RealCr[p]=Cr[p];};return RealCr;};
