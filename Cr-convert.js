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
Cr.__reservedWords = {"break":1,"else":1,"new":1,"var":1,"case":1,"finally":1,"return":1,"void":1,"catch":1,"for":1,"switch":1,"while":1,"continue":1,"function":1,"this":1,"with":1,"default":1,"if":1,"throw":1,"delete":1,"in":1,"try":1,"do":1,"instanceof":1,"typeof":1,"abstract":1,"enum":1,"int":1,"short":1,"boolean":1,"export":1,"interface":1,"static":1,"byte":1,"extends":1,"long":1,"super":1,"char":1,"final":1,"native":1,"synchronized":1,"class":1,"float":1,"package":1,"throws":1,"const":1,"goto":1,"private":1,"transient":1,"debugger":1,"implements":1,"protected":1,"volatile":1,"double":1,"import":1,"public":1,"null":1,"true":1,"false":1};
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
				js+=indent+opt.e+'"'+cn[i].nodeName.toLowerCase()+'"';
				if(cn[i].attributes.length > 0 || cn[i].childNodes.length > 0 || depth==0){
					js+=',{';
					if(cn[i].attributes.length > 0){
						var events='';
						for( var a=0;a<cn[i].attributes.length;a++ ){
							var artib=cn[i].attributes[a];
							var origExtraQuotes=extraQuotes;
							if(Cr.__reservedWords[artib.nodeName])extraQuotes='"';
							if(artib.nodeName.substr(0,2)=='on'){
								events+='["'+artib.nodeName.substr(2)+'",'+extraQuotes+artib.nodeValue.substr(0,artib.nodeValue.indexOf('('))+extraQuotes+']';
							}else
								js+=extraQuotes+artib.nodeName+extraQuotes+':"'+artib.nodeValue+'",';
							extraQuotes=origExtraQuotes;
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
					tx=tx.replace(/\n/g,'').replace(/\r/g,'');
				}else
					tx=tx.replace(/\n/g,quo_newline).replace(/\r/g,'');

				tx=tx.replace(/\t/g,quo_tabs);

				tx=tx.replace(/\\/g,esc);

				tx=tx.replace(/"/g,esc+'"');

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