Cr.javascriptFromHTML = function(html,options){
	return this.__performConversionFromHTML({
		e:'Cr.elm(',//element node begining
		t:'Cr.txt(',//text node begining
		n:')',		//node end
		q:false,	//extra quotes
		s:false		//escape newlines
	},html,options);
};

Cr.JSONfromHTML = function(html,options){
	return this.__performConversionFromHTML({
		e:'{"elm":[',
		t:'{"txt":[',
		n:']}',
		q:true,
		s:true
	},html,options);
};

Cr.javascriptObjectfromHTML = function(html,options){
	return this.__performConversionFromHTML({
		e:'{elm:[',
		t:'{txt:[',
		n:']}',
		qe:'{"elm":[',
		qt:'{"txt":[',
		q:false,
		s:false
	},html,options);
};

Cr.javascriptSimpleObjectfromHTML = function(html,options){
	return this.__performConversionFromHTML({
		e:'{',//element node begining
		t:'{text:',//text node begining
		n:'}',		//node end
		q:false,
		s:false,
		nodeIsKey:true //cr strutured like function call or its not
	},html,options);
};

Cr.nodeToCrSimpleJson = function(node,options){
	this.__performConversionOfNode({
		e:'{',//element node begining
		t:'{text:',//text node begining
		n:'}',		//node end
		q:false,	 	//extra quotes
		nodeIsKey:true //cr strutured like function call or its not
	},node,options)
};

Cr.nodeToCrJavascript = function(node,options){
	this.__performConversionOfNode({
		e:'Cr.elm(',//element node begining
		t:'Cr.txt(',//text node begining
		n:')',		//node end
		q:false	 	//extra quotes
	},node,options)
};

Cr.nodeToCrJSON = function(node,options){
	this.__performConversionOfNode({
		e:'{"elm":[',
		t:'{"txt":[',
		n:']}',
		q:true
	},node,options)
};

Cr.nodeToCrJavascriptObject = function(node,options){
	this.__performConversionOfNode({
		e:'{elm:[',
		t:'{txt:[',
		n:']}',
		qe:'{"elm":[',
		qt:'{"txt":[',
		q:false
	},node,options)
};
/* internal use only */
Cr.__reservedWords = {"break":1,"else":1,"new":1,"var":1,"case":1,"finally":1,"return":1,"void":1,"catch":1,"for":1,"switch":1,"while":1,"continue":1,"function":1,"this":1,"with":1,"default":1,"if":1,"throw":1,"delete":1,"in":1,"try":1,"do":1,"instanceof":1,"typeof":1,"abstract":1,"enum":1,"int":1,"short":1,"boolean":1,"export":1,"interface":1,"static":1,"byte":1,"extends":1,"long":1,"super":1,"char":1,"final":1,"native":1,"synchronized":1,"class":1,"float":1,"package":1,"throws":1,"const":1,"goto":1,"private":1,"transient":1,"debugger":1,"implements":1,"protected":1,"volatile":1,"double":1,"import":1,"public":1,"null":1,"true":1,"false":1};
Cr.__performConversionFromHTML = function(opt,html,options){
	var dv=document.createElement('div');
	dv.innerHTML=html;
	return this.__performConversionFromNodeChildren(opt,dv,options);
};
Cr.__performConversionOfNode = function(opt,node,options){
	var dv;
	if(node.parentNode)dv=parentNode;
	else{
		dv=document.createElement('div');
		dv.appendChild(node);
	}
	return this.__performConversionFromNodeChildren(opt,dv,options);
};
Cr.__performConversionFromNodeChildren = function(opt,node,options){
	var oneline=options.oneline;
	var removeWhitespace=options.removeWhitespace;
	var whitespaceReplaceWith=options.whitespaceReplaceWith;
	var childNodeAttributes=options.childNodeAttributes;
	var quoteAllAttributes = options.quoteAllAttributes;
	var jsout='';
	var newline='';
	var tab='';
	var extraQuotes='';
	var destExtraQuotes='';
	var elementNameQuotes='"';
	var quo_newline='\\n';
	var quo_tabs='\\t';	// for visible tabs change to '	'
	var esc='\\';
	var attributesStart=',{';
	var attribNewLines=false;
	if(!oneline){
		newline="\r\n";
		tab="\t";
	}
	if(opt.nodeIsKey){
		attributesStart=':{';
		elementNameQuotes='';//unless all quoets enabled
		attribNewLines=true;
		childNodeAttributes=true;
	}
	if(childNodeAttributes || !oneline){
		attribNewLines=true;
	}
	if(opt.q){
		extraQuotes=destExtraQuotes='"';
	}
	if(quoteAllAttributes){
		extraQuotes='"';
		elementNameQuotes='"'
		opt.e=opt.qe||opt.e;
		opt.t=opt.qt||opt.t;
	}
	if(removeWhitespace){
		if(typeof(whitespaceReplaceWith)=='undefined')whitespaceReplaceWith='';
	}
	function createChildNodes(elm, indent, childNodeI,depth){
		var js ='';
		if(childNodeI.childNodes.length > 0){
			if(elm.childNodes && childNodeI.childNodes.length > 0){
				js+=",["+newline+crChildren(childNodeI,depth+1)+newline+indent+']';
			}
		}else if(depth==0){
			js+=',[]';
		}
		return js;
	}
	function createChildNodesAsAttribute(elm, indent, childNodeI ,depth){
		var js ='';
		var oldIndent = indent;
		//if(!oneline)for(var d=0;d<depth;d++) indent+=tab;

		if(elm.childNodes && childNodeI.childNodes.length > 0){
			js+=newline+crChildren(childNodeI,depth+1)+newline+indent+tab;
		}

		js = extraQuotes+'childNodes'+extraQuotes+':['+js+']'+newline+indent;
		return js;
	}
	function quoteKeyName(quoteVar, text){
		if(Cr.__reservedWords[text])quoteVar='"';
		return quoteVar+text+quoteVar;
	}
	function crChildren(elm,depth){
		var js='';
		var cn=elm.childNodes;
		for(var i=0,l=cn.length;i<l;i++){
			var indent='';
			if(!oneline)for(var d=0;d<depth;d++) indent+=tab;
			if(cn[i].nodeType == 1){
				js+=indent+opt.e+quoteKeyName(elementNameQuotes,cn[i].nodeName.toLowerCase());
				if(cn[i].attributes.length > 0 || cn[i].childNodes.length > 0 || depth==0 || opt.nodeIsKey){
					js+=attributesStart;
					var attribSeperator=','
					var attribNewline=newline+indent+tab;
					if(attribNewLines){
						attribSeperator=','+attribNewline;
						if(cn[i].attributes.length > 0 || (childNodeAttributes && cn[i].childNodes.length)){
							js+=attribNewline;
						}
					}
					if(cn[i].attributes.length > 0){
						var events='';
						for( var a=0;a<cn[i].attributes.length;a++ ){
							var artib=cn[i].attributes[a];
							if(artib.nodeName.substr(0,2)=='on'){
								events+='["'+artib.nodeName.substr(2)+'",'+extraQuotes+artib.nodeValue.substr(0,artib.nodeValue.indexOf('('))+extraQuotes+']';
							}else
								js+=quoteKeyName(extraQuotes,artib.nodeName)+':"'+artib.nodeValue+'"'+attribSeperator;
						}
						if(events.length > 0){
							js+=extraQuotes+'events'+extraQuotes+':['+events+']'+attribSeperator;
						}
						if(!childNodeAttributes || !cn[i].childNodes.length){
							js=js.substr(0,js.length-attribSeperator.length); // duplicated
							if(attribNewLines){
								js+=newline+indent;
							}
						}
					}
					if( cn[i].childNodes.length > 0 ){
						if( childNodeAttributes ){
							js+=createChildNodesAsAttribute(elm, indent, cn[i], depth+1);
						}
					}
					js+='}';
				}
				if( !childNodeAttributes ){
					js+=createChildNodes(elm, indent, cn[i], depth);
				}
				if(!opt.nodeIsKey && depth==0){		//finally if there is an append to, and we're not in SimpleJSON mode
					js+=','+destExtraQuotes+'document.body'+destExtraQuotes;
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