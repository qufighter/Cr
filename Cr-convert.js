/* */
Cr.javascriptFromHTML = function(html,removeWhitespace,whitespaceReplaceWith){
	var jsout='';
	var dv=document.createElement('div');
	dv.innerHTML=html;
	
	if(removeWhitespace){
		if(typeof(whitespaceReplaceWith)=='undefined')whitespaceReplaceWith='';
	}
	
	function crChildren(elm,depth){
		var js='';
		//console.log(elm.childNodes);
		
		var cn=elm.childNodes;
		for(var i=0,l=cn.length;i<l;i++){
		//	console.log(cn[i]);
			var indent='';
			for(var d=0;d<depth;d++)
					indent+="\t";
			
			if(cn[i].nodeType == 1){
				
				js+=indent+'Cr.elm("'+cn[i].localName+'"';
				
				js+=',{'
				if(cn[i].attributes.length > 0){
					var events='';
					for( var a=0;a<cn[i].attributes.length;a++ ){
						var artib=cn[i].attributes[a]
						if(artib.nodeName.substr(0,2)=='on'){
							events+='["'+artib.nodeName.substr(2)+'",'+artib.nodeValue.substr(0,artib.nodeValue.indexOf('('))+']';
						}else
							js+=artib.nodeName+':"'+artib.nodeValue+'",';
					}
					if(events.length > 0){
						js+='events:['+events+'],';
					}
					js=js.substr(0,js.length-1);
				}
				js+='}'
				
				if(cn[i].childNodes.length > 0){
					if(elm.childNodes && cn[i].childNodes.length > 0){
						js+=",[\r\n"+crChildren(cn[i],depth+1)+'\r\n'+indent+']';
					}
				}else if(depth==0){
					js+=',[]';
				}
				
				if(depth==0){//finally if there is an append to
					js+=',document.body';
				}
				
				js+='),'+"\r\n";
			}else if(cn[i].nodeType == 3){
				//data, nodeValue, textContent, wholeText
				//js+='Cr.txt("'+cn[i].nodeValue.replace("\r\n","\n").replace("\r\n","\n").replace("\n","\\n")+'"),'+"\r\n";
				
				var tx=cn[i].nodeValue;
				if(removeWhitespace && tx !=' '){
					tx=tx.replace(/^\s+|\s+$/g, whitespaceReplaceWith);
				}else
					tx=tx.replace(/\n/g,'\\n').replace(/\r/g,'');
				
				if(tx.length > 0)
					js+=indent+'Cr.txt("'+tx+'"),'+"\r\n";
				
				//js+='Cr.txt("textnode"),'+"\r\n";
			}

		}
		if(js.length > 0)
			js=js.substr(0,js.length-3);
		return js;
	}
	
	if(dv.childNodes && dv.childNodes.length > 0) jsout = crChildren(dv,0);
	return jsout;
}