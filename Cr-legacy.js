//cel [create element] lib by Sam Larison -- Sam @ Vidsbee.com | cr.js | cr.elm | Cr::elm
window.Cr = {
	delayedListeners : true,//use an array of loadevents:[] for early attachment
/*******************************************************************************
 Usage A: 
         Cr.elm('div',{'id':'hello','event':['click',function(){alert('hi');}]},[
           Cr.elm('text inside block element'),
           Cr.elm('hr',{'style':'clear:both;'})
         ],document.body);
         
 Usage B: 
         var myelm = Cr.elm('div',{'id':'hello','event':['click',function(){alert('hi');}]},[
           Cr.elm('text inside block element'),
           Cr.elm('hr',{'style':'clear:both;'})
         ]);
         
         document.body.appendChild(myelm);
         Cr.addListeners();
         
         OR
         
         Cr.insertNode(myelm, document.body); //calls addListeners automatically
         
 Creates:
         <div id="hello">
           text inside block element
           <hr style="clear:both;">
         </div>
         
         Where clicking the text or hr displays 'hi'
         
 Pattern:
         Cr.elm('div',{'attribute':'one'},[Cr.elm(' children')],document.body);
         
         <body><div attribute="one">children</div></body>
         
   Conclusions: you may nest Cr.elm calls in exactly the same way 
                as you would nest HTML elements.
        
 Parameters: 
   nodeType node type such as 'img' 'div' or 'a'
          OR a text node string containing a space or HTML entities
           (Text nodes will be trimmed)
          OR an html entity.  Use &nbsp for adding a single space.
   attributes an object {} that contains attributes.  Once special attribute 
          'events' may be used to specify events as follows:
          {'href':'#','events':[['mouseover',callfn,false],['mouseout',callfn2]]}
          to ensure these listeners are attached see appendTo below.
          the format for events is [eventType,callback,useCapture], you may also 
          specify a single event.  See appendTo below for event attachment info
          
          'loadevents' may be used to specify early attach events as follows:
          {'loadevents':[['load',loadedFn,false],['load',loadedFn2]],'src':'img.png'}
          load events are attached immediately in the order they are processed.  If
          you wish load events to be attached before src is defiend to counter an IE
          but where cached images load event fires immediately, 
          then sepecify loadevents before src
   addchilds an array [] containing nodes to be appended as children, could contain
          an array of calls to Cr.elm which create this array of nodes.
   appnedTo should ONLY be specified on the last element that needs to be created
          which means the TOP level element (or the final parameter on the first 
          or outter most call to cr.elm).
          if no appendTo is specified then Cr.addListeners() must be called 
          after you append the element returned by the outermost Cr.elm call.
          Or if you add the elmenet with Cr.insertNode(newNode, parentElem)
          then addListeners will be called automatically.
 Empty Patteren:
          Cr.elm(' text node',{},[],document.body);
*******************************************************************************/
	elm : function(nodeType,attributes,addchilds,appnedTo){
		var ne,i,l;
		if( nodeType.length < 1 || nodeType.indexOf(' ') > -1 ||  nodeType.indexOf('&') > -1 || nodeType.indexOf('%') > -1 ){
			ne=document.createTextNode(this.unescapeHtml(nodeType.replace(/^\s+/,""))); //ltrim
			if(!attributes && !addchilds && appnedTo){
				appnedTo.appendChild(ne);
				return ne;// short circut if we know nothing else is done by this function
			}
		}else
			ne=document.createElement(nodeType);
		if(attributes){
			if(attributes['class'] && !attributes['className'])
				ne.className=attributes['class'];//IE7 bug
			if(attributes['style'])
				ne.style.cssText=attributes['style'];//IE7 bug
			//load events must be registered before the src is set IE7 bug
			if( attributes.loadevent || attributes.loadevents ){
				var lev=attributes.loadevent || attributes.loadevents;
				if(typeof(lev[0])=='string') this.registerEventListener(ne,lev[0],lev[1],lev[2]);
				else if(lev.length)
					for(i=0,l=lev.length;i<l;i++)
						this.registerEventListener(ne,lev[i][0],lev[i][1],lev[i][2]);
			}
			if( attributes.event || attributes.events ){
				var lev=attributes.event || attributes.events;
				if(this.delayedListeners){
					if(typeof(lev[0])=='string') this.pendingListenrs.push([ne,[lev]]);
					else this.pendingListenrs.push([ne,lev]);
				}else{
					if(typeof(lev[0])=='string') this.registerEventListener(ne,lev[0],lev[1],lev[2]);
					else if(lev.length)
						for(i=0,l=lev.length;i<l;i++)
							this.registerEventListener(ne,lev[i][0],lev[i][1],lev[i][2]);
				}
			}
		}
		for( i in attributes ){
			if( i.substring(0,5) == 'event' || i.substring(0,9) == 'loadevent' ){
				//handled earlier
			}else if( i == 'checked' || i == 'selected'){
				if(attributes[i])ne.setAttribute(i,i);
			}else ne.setAttribute(i,attributes[i]);
		}
		if(addchilds){
			for( i=0,l=addchilds.length;i<l;i++ ){
				if(addchilds[i])ne.appendChild(addchilds[i]);//you probably forgot a comma when calling the function
			}
		}
		if(appnedTo){
			this.insertNode(ne, appnedTo);
		}
	
		return ne;//identifier unexpected error pointing here means you're missing a comma on the row before inside an array of nodes addchilds
	},
	/*Cr.txt is a simple shortcut function that is not very useful in any case 
	other than to save a tiny bit of overhead involved in using 
	Cr.elm(' text string'), however the benefits of using Cr.elm 
	(html entity decoding, support for creating a single space using &nbsp, etc) 
	outweigh many uses for this function, since one may often not know if 
	decoding entities (using dynamic content) will be required or not */
	txt : function(textContent){
		return document.createTextNode(textContent);
	},
	/*Cr.ent creates text nodes that may or may not contain HTML entities.  From a
	single entity to many entities interspersed with text are all supported by this */
	ent : function(textContent){
		return document.createTextNode(this.unescapeHtml(textContent.replace(/^\s+/,"")));
	},
	/*Cr.paragraphs creates an array of nodes that may or may not contain HTML entities.
	Each occurance of a newline "\n" creates two line breaks.  This function can just 
	as easily create <p> tags, however this broke access to floated elements 
	returns an array of nodes which can be appended as the addchilds for any node created
	using Cr.elm */
	paragraphs : function(textContent){
		var textPieces=textContent.split("\n");
		var elmArray=[];
		for(var i=0,l=textPieces.length;i<l;i++){
			//elmArray.push(Cr.elm('p',{},[Cr.ent(textPieces[i])]));
			elmArray.push(Cr.ent(textPieces[i]));
			elmArray.push(Cr.elm('br'));
			elmArray.push(Cr.elm('br'));
		}
		return elmArray;
	},
	/* Appends the child element and also attaches any pending listeners in one step */
	/* depricated, use insertNode instead v */
	appendChildElement : function(parentElem, childNode){
		parentElem.appendChild(childNode);
		this.addListeners();
	},
	/* Appends the child element and also attaches any pending listeners in one step */
	/* it is expected that parentNode is already attached to the visible document.body */
	insertNode : function(newNode, parentElem, optionalInsertBefore, skipListeners){
		if(!parentElem)parentElem=document.body;
		if(optionalInsertBefore && optionalInsertBefore.parentNode == parentElem){
			parentElem.insertBefore(newNode,optionalInsertBefore);
		}else{
			parentElem.appendChild(newNode);
		}
		if(!skipListeners)this.addListeners();
	},
	insertNodes : function(newNodes, parentElem, optionalInsertBefore){
		if(newNodes.nodeType)
			this.insertNode(newNodes, parentElem, optionalInsertBefore);
		else{
			for(var i=0,l=newNodes.length;i<l;i++){
				this.insertNode(newNodes[i], parentElem, optionalInsertBefore, true);
			}
			this.addListeners();
		}
	},
	/* in many situations, after you append the element(s), 
	(unless Cr.elm appends them for you) you must call Cr.addListeners() 
	if you have used the attribute events to specify event listeners. 
	Use the above function instead: Cr.insertNode(newNode, parentElem);
	Listeners should not be attached until the nodes are inserted into the DOM
	*/
	addListeners : function(){
		for( i in this.pendingListenrs ){
			for( z in this.pendingListenrs[i][1]){
				//if(this.pendingListenrs[i][0] && this.pendingListenrs[i][1][z][1])//if element && function exist...
				this.registerEventListener(this.pendingListenrs[i][0],this.pendingListenrs[i][1][z][0],this.pendingListenrs[i][1][z][1],this.pendingListenrs[i][1][z][2]?this.pendingListenrs[i][1][z][2]:false);
			}
		}
		this.pendingListenrs=[]
	},
	empty : function(node){
		while(node.lastChild)node.removeChild(node.lastChild);
	},
	registerEventListener : function(element,type,func,capture){//extrapolated from Tim Taylor's cevents
		if(typeof(element.addEventListener)=='function'){
			element.addEventListener(type,func,capture);
		}else if (element.attachEvent){
			if(!element._listeners) element._listeners=[];
			if(!element._listeners[type]) element._listeners[type]=[];
			var workaroundFunc=function(){func.apply(element,[])};
			element._listeners[type][func]=workaroundFunc;
			element.attachEvent('on'+type,workaroundFunc);
		}
	},
	unescapeHtml : function(str) { //trick used to make HTMLentiites work inside textNodes
		if(str.length < 1)return str;
    var temp = document.createElement("div");
    temp.innerHTML = str;
    var result = temp.childNodes[0].nodeValue;
    temp.removeChild(temp.firstChild);
    return result;
	},
	pendingListenrs : []
};
