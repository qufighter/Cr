Cr.javascriptFromHTML = function(html,oneline,removeWhitespace,whitespaceReplaceWith){
	return this.__performConversionFromHTML({
		e:'Cr.elm(',//element node begining
		t:'Cr.txt(',//text node begining
		n:')',		//node end
		q:false,	//extra quotes
		s:false		//escape newlines
	},html,oneline,removeWhitespace,whitespaceReplaceWith);
};

Cr.JSONfromHTML = function(html,oneline,removeWhitespace,whitespaceReplaceWith){
	return this.__performConversionFromHTML({
		e:'{"elm":[',
		t:'{"txt":[',
		n:']}',
		q:true,
		s:true
	},html,oneline,removeWhitespace,whitespaceReplaceWith);
};

Cr.javascriptObjectfromHTML = function(html,oneline,removeWhitespace,whitespaceReplaceWith){
	return this.__performConversionFromHTML({
		e:'{elm:[',
		t:'{txt:[',
		n:']}',
		q:false,
		s:false
	},html,oneline,removeWhitespace,whitespaceReplaceWith);
};

Cr.nodeToCrJavascript = function(node,oneline,removeWhitespace,whitespaceReplaceWith){
	this.__performConversionOfNode({
		e:'Cr.elm(',//element node begining
		t:'Cr.txt(',//text node begining
		n:')',		//node end
		q:false,	//extra quotes
		s:false		//escape newlines
	},node,oneline,removeWhitespace,whitespaceReplaceWith)
};

Cr.nodeToCrJSON = function(node,oneline,removeWhitespace,whitespaceReplaceWith){
	this.__performConversionOfNode({
		e:'{"elm":[',
		t:'{"txt":[',
		n:']}',
		q:true,
		s:true
	},node,oneline,removeWhitespace,whitespaceReplaceWith)
};

Cr.nodeToCrJavascriptObject = function(node,oneline,removeWhitespace,whitespaceReplaceWith){
	this.__performConversionOfNode({
		e:'{elm:[',
		t:'{txt:[',
		n:']}',
		q:false,
		s:false
	},node,oneline,removeWhitespace,whitespaceReplaceWith)
};
/* internal use only */
Cr.__performConversionFromHTML = function(opt,html,oneline,removeWhitespace,whitespaceReplaceWith){
	var dv=document.createElement('div');
	dv.innerHTML=html;
	return this.__performConversionFromNodeChildren(opt,dv,oneline,removeWhitespace,whitespaceReplaceWith);
};
Cr.__performConversionOfNode = function(opt,node,oneline,removeWhitespace,whitespaceReplaceWith){
	var dv;
	if(node.parentNode)dv=parentNode;
	else{
		dv=document.createElement('div');
		dv.appendChild(node);
	}
	return this.__performConversionFromNodeChildren(opt,dv,oneline,removeWhitespace,whitespaceReplaceWith);
};
Cr.__performConversionFromNodeChildren = function(opt,node,oneline,removeWhitespace,whitespaceReplaceWith){
	var jsout='';
	var newline='';
	var tab='';
	var extraQuotes='';
	var quo_newline='\\n';
	var quo_tabs='\\t';	// for visible tabs change to '	'
	var esc='\\';
	if(!oneline){
		newline="\r\n";
		tab="\t";
	}
	if(opt.q){
		extraQuotes='"';
	}
	if(opt.s){
		//quo_newline='\\\\n';
		//quo_tabs='\\\\t';
		esc='\\\\';
	}
	if(removeWhitespace){
		if(typeof(whitespaceReplaceWith)=='undefined')whitespaceReplaceWith='';
	}
	function crChildren(elm,depth){
		var js='';
		var cn=elm.childNodes;
		for(var i=0,l=cn.length;i<l;i++){
			var indent='';
			if(!oneline)for(var d=0;d<depth;d++) indent+=tab;
			if(cn[i].nodeType == 1){
				js+=indent+opt.e+'"'+cn[i].localName+'"';
				if(cn[i].attributes.length > 0 || cn[i].childNodes.length > 0 || depth==0){
					js+=',{';
					if(cn[i].attributes.length > 0){
						var events='';
						for( var a=0;a<cn[i].attributes.length;a++ ){
							var artib=cn[i].attributes[a];
							if(artib.nodeName.substr(0,2)=='on'){
								events+='["'+artib.nodeName.substr(2)+'",'+extraQuotes+artib.nodeValue.substr(0,artib.nodeValue.indexOf('('))+extraQuotes+']';
							}else
								js+=extraQuotes+artib.nodeName+extraQuotes+':"'+artib.nodeValue+'",';
						}
						if(events.length > 0){
							js+=extraQuotes+'events'+extraQuotes+':['+events+'],';
						}
						js=js.substr(0,js.length-1);
					}
					js+='}';
				}
				if(cn[i].childNodes.length > 0){
					if(elm.childNodes && cn[i].childNodes.length > 0){
						js+=",["+newline+crChildren(cn[i],depth+1)+newline+indent+']';
					}
				}else if(depth==0){
					js+=',[]';
				}
				if(depth==0){		//finally if there is an append to
					js+=','+extraQuotes+'document.body'+extraQuotes;
				}
				js+=opt.n+','+newline;
			}else if(cn[i].nodeType == 3){//text nodes
				var tx=cn[i].nodeValue;
				if(removeWhitespace && tx !=' '){
					tx=tx.replace(/^\s+|\s+$/g, whitespaceReplaceWith);
				}else
					tx=tx.replace(/\n/g,quo_newline).replace(/\r/g,'');
				
				tx=tx.replace(/\t/g,quo_tabs);
				
				tx=tx.replace(/\\/g,esc);
				
				if(tx.length > 0)
					js+=indent+opt.t+'"'+tx+'"'+opt.n+','+newline;
			}
		}
		if(js.length > 0)
			js=js.substr(0,js.length-(newline.length+1));
		return js;
	};
	if(node.childNodes && node.childNodes.length > 0) jsout = crChildren(node,0);
	return jsout;
};