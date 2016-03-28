"use strict";

var y = true;
var inlineSlashifiable = {'hr':y,'br':y,'img':y,'link':y,'meta':y,'input':y};

var __newParent = function(ownerNode, c){
	if( c.parentNode ) c.parentNode.removeChild(c);
	c.parentNode = ownerNode;
}

var __addNode = function(ownerNode, c){
	__newParent(ownerNode, c);
	ownerNode.childNodes.push(c);
}

var __toKeys = function(arr){
	var map = {};
	for( var n=0,l=arr.length; n<l; n++ ){
		map[arr[n]] = true;
	}
	return map;
};

var __parseSelectors = function(selectors){
	var nextSelector = __nextSelector(selectors), allSelectors = [];
	while(nextSelector){
		allSelectors.push(nextSelector.selector);
		nextSelector = __nextSelector(nextSelector.remaining);
	}
	return allSelectors;

}

var __nextSelector = function(selectors){
	var selector = {classes:{}, attributes: {}, nextSelectorCombinator: null}, sstr, ncomb, ncombType, scmp, components, type, mapType, val;

	var combinators = {
		'': 'descendant',
		'>': 'child',
		'~': 'subsequentSiblings',
		'+': 'nextSiblings'
	}

	var types = {
		'': 'type',
		'#': 'id'
	}
	var mapTypes = {
		'.': 'classes',
		'[': 'attributes'
	}

	var comparitors = {
		'' : function(v){return v;},
		'=' : function(v){return new RegExp('^'+v+'$');},
		'~=' : function(v){return new RegExp('^'+v+'\s|\s'+v+'\s|\s'+v+'$');},
		'|=' : function(v){return new RegExp('^'+v+'$|^'+v+'-');}, // really useful?
		'^=' : function(v){return new RegExp('^'+v);},
		'$=' : function(v){return new RegExp(v+'$');},
		'*=' : function(v){return v;}
		// [attr operator value i] https://developer.mozilla.org/en-US/docs/Web/CSS/Attribute_selectors
	}

	var typeProcessors = {
		attributes: function(s, val){
			var kvp = val.match(/^([^=~|^$*]+)([=~|^$*]{0,2})"*([^"]*)/), k, v, c;
			if( !kvp || kvp.length < 4 ) return;
			k=kvp[1], c=kvp[2], v=kvp[3];
			console.log(val, k,c,v)
			s.attributes[k] = comparitors[c](v); // we.match(v) if its truthy (if falsey, we allow the attribute basedon presense of key)
		}
	}

	// matches only first attribute 'div[class~="fun"]'.match(/^[^ >~+[]+[\[]?[^=~|^$*]*[=~|^$*]{0,2}[^ >~+]*/)
	sstr = selectors.match(/^[^ >~+]+/); // TODO: warning [key="quoted"] attrib selector may contain these though [also anywhere inside brackets can contain ~]
	if( !sstr || sstr.length != 1 ) return false;
	sstr = sstr[0]; //!!!!


	ncomb = selectors.substr(sstr.length).match(/^[ >~+]+/);
	//console.log(sstr, ncomb);
	if( ncomb && ncomb.length ){
		ncomb = ncomb[0];
		ncombType = ncomb.replace(/ /g, '');
		selector.nextSelectorCombinator = combinators[ncombType];
	}else{
		ncomb = "";
	}

	scmp = sstr.match(/[.#\[]?[^.#\[\]]+[\]]?/g); // "

	for( var i=0,l=scmp.length; i<l; i++ ){
		components = scmp[i].match(/^([.#\[]?)([^\]]+)/);
		if( !components || components.length < 3 ) continue; //somethign broke!!!

		type = components[1];
		val = components[2];
		mapType = mapTypes[type];

		if( types[type] ){
			selector[types[type]] = val;
		}else if( mapType ) {
			if( typeProcessors[mapType] ){
				typeProcessors[mapType](selector, val);
			}else selector[mapType][val] = true;
		}
	}

	return {selector:selector, remaining: selectors.substr(sstr.length + ncomb.length) };
}

var __matches = function(node, selectors){
	selectors = typeof selectors === 'string' ? __parseSelectors(selectors) : selectors; // selectors may already be parsed
	// native matches could be cool,
	// since this may consider parent nodes!
	// and the element must really match the final selector
	// sure we could just call document.querySelectorAll and return the matching node from that set if found
	// but what is the fun in that!
}

var __querySelectorAll = function(node, selectors, selectorIndex){
	var matchedNodes = [], parentSelector, selectorComponent, nextSelectorComponent, nextNextSelectorComponent, nextChildNode;  // these nodes matched top level selector... need to probably verify they match full query before adding

	if( !node.childNodes ) return matchedNodes;

	selectors = typeof selectors === 'string' ? __parseSelectors(selectors) : selectors; // selectors may already be parsed

	parentSelector = {nextSelectorCombinator:'descendant'};
	selectorIndex = selectorIndex || 0;
	selectorComponent = selectors[selectorIndex];

	if( selectors[selectorIndex-1] ){
		parentSelector = selectors[selectorIndex-1];
	}

	var siblingProcessorsMode = {
		'nextSiblings': 'single',
		'subsequentSiblings': 'multi'
	}

	nextSelectorComponent = selectors[selectorIndex+1];
	nextNextSelectorComponent = selectors[selectorIndex+2];

	for( var n=0,n2=0,l=node.childNodes.length; n<l; n++ ){

		if( node.childNodes[n].__matchesSelectorComponent(selectorComponent) ){
			if( selectorComponent.nextSelectorCombinator && nextSelectorComponent ){
				n2 = n+1;
				nextChildNode = node.childNodes[n2];
				if( siblingProcessorsMode[selectorComponent.nextSelectorCombinator] && nextChildNode){
					while( nextChildNode ){
						if( nextChildNode.__matchesSelectorComponent(nextSelectorComponent) ){
							if( !nextNextSelectorComponent ){
								matchedNodes.push(nextChildNode);
							}
							else{
								matchedNodes = matchedNodes.concat( __querySelectorAll(nextChildNode, selectors, selectorIndex+2) );
							}
						}
						if( siblingProcessorsMode[selectorComponent.nextSelectorCombinator] == 'multi' ){
							nextChildNode = node.childNodes[++n2];
							if( nextChildNode && nextChildNode.__matchesSelectorComponent(selectorComponent) ){
								nextChildNode = false; // we found our own node again, we'll be in this loop again and search for it's subsequentSiblings soon, break;
							}
						}else{
							nextChildNode = false; // break;
						}
					}
				}else{
					matchedNodes = matchedNodes.concat( __querySelectorAll(node.childNodes[n], selectors, selectorIndex+1) );
				}
			}else{
				// we are on the final selector, and it matched!
				matchedNodes.push(node.childNodes[n]);
			}
		}
		if( parentSelector.nextSelectorCombinator == 'descendant' ){ // this check for querySelectorAll should PROBABLY happen at top of this function, check node has childNodes ?
			matchedNodes = matchedNodes.concat( __querySelectorAll(node.childNodes[n], selectors, selectorIndex) );
		}
	}
	return matchedNodes;
};


var Cr_fragment = function(ownerNode){
	this.nodeType = 11; // could define getter only
	ownerNode = ownerNode || this; // owner node should basically never be provided except for internal usage... once the fragment is inserted however, each elements parent node could be updated
	this.childNodes = [];
	this.parentNode = false;

	this.appendChild = function(c){
		// c is suppose to be a node, but it could be a fragment too... since fragments render like regular HTML its not really distinguishable server side
		// if c is a fragment.... we might do things a little differently
		// we could append each child node in that case... since each element in the fragment will have the wrong parentNode (fragment itself)

		// if( c.nodeType==11 ){ // more document like
		// 	while( c.childNodes.length ){
		// 		this.__addNode(ownerNode, c.childNodes[0]);
		// 	}
		// }else{
		// 	this.__addNode(ownerNode, c);
		// }
		// return c;

		// ideally if c is a fragment, we might just append the whole fragment as a single child node still
		// what we have now works, but traversing the hierarchy that contains fragments will not work exactly the way you would expect it to work client side (see above) at this time, since each fragment is "one node".
		__addNode(ownerNode, c);
		return c; // "penalty of removal free"
	};

	this.insertBefore = function(c,b){
		for( var n=0,l=this.childNodes.length; n<l; n++ ){
			if( this.childNodes[n] === b ){
				__newParent(ownerNode, c);
				this.childNodes.splice(n, 0, c);
				return c;
			}
		}
	};

	this.removeChild = function(c){
		for( var n=0,l=this.childNodes.length; n<l; n++ ){
			if( this.childNodes[n] === c ){
				return this.childNodes.splice(n, 1);
			}
		}
	};

	this.cache = function(){
		// not standard dom, caches element to html representation (text node), prevents further manipulation
		return new Cr_text(this.__outerHTML());
	};


	this.querySelector = function(selectors){
		//simplified for now to the more expensive
		// a future 4rd argument to __querySelectorAll may lead it to return early as it finds a match
		var results = __querySelectorAll(this, selectors, 0);
		return results.length ? results[0] : null;
	};

	this.querySelectorAll = function(selectors){
		var results = __querySelectorAll(this, selectors);
		return results.length ? results : null;
	};

	this.__outerHTML = function(){
		return this.__innerHTML();
	};

	this.__innerHTML = function(){
		var childHtml = '';
		for( var n=0,l=this.childNodes.length; n<l; n++ ){
			childHtml+=this.childNodes[n].__outerHTML(); // could call outerHTML() here, we don't for quickness
		}
		return childHtml;
	};

	this.__empty = function(){
		while(this.lastChild) this.removeChild(this.lastChild);
	};

	Object.defineProperty(this, "lastChild",{
		get: function() {
			return this.childNodes[this.childNodes.length-1];
		}
	});

	Object.defineProperty(this, "nodeValue",{
		get: this.__innerHTML
	});

	Object.defineProperty(this, "outerHTML",{
		get: this.__outerHTML
	});

	Object.defineProperty(this, "innerHTML",{
		get: this.__innerHTML,
		set: function(t){
			this.__empty();
			this.appendChild(new Cr_text(t));
		}
	});

};


var Cr_element = function(n){
	this.localName = n;
	this.nodeType = 1; // could define getter only
	this.__fragment = new Cr_fragment(this); // the fragment contains all the child nodes... several node properties exist on the fragment for convenience
	this.childNodes = this.__fragment.childNodes;
	this.parentNode = this.__fragment.parentNode;
	this.querySelector = this.__fragment.querySelector;
	this.querySelectorAll = this.__fragment.querySelectorAll;
	this.attributes = {}; // recommend you do not use this since it works poorly client side

	this.__cachedAttributes = ""; // you know its going to happen

	this.setAttribute = function(key, val){
		this.attributes[key] = val;
	};

	this.getAttribute = function(key){
		return this.attributes[key];
	};

	this.removeAttribute = function(key){
		// return delete this.attributes[key];
		this.attributes[key] = null; // we omit null or undefined attributes
	};

	this.addEventListener = function(event, listener, captrue){
//http://stackoverflow.com/questions/18002799/running-multiple-files-on-node-js-at-the-same-time
//http://nodejs.org/api/modules.html

		// current thinking is this may operate in different configurable modes.
		// the default mode right now tries to use legacy onEVENT attributes and the event keyword present there
		// to trigger the event function in a way that is compatible with addEventListener, where the
		// first argument passed to the listener is the event

		var isAttrEvent = event.substr(0,2) == 'on'; // seems improper to ever provide events:['onclick',fn] due to client side incompatibility
		// if that's ever really needed, it should probably be set as a regular attribute not a special event/s attribute
		var onEvent = isAttrEvent ? event : 'on'+event;

		//TO IMPLEMENT - two modes?
		if( typeof(listener) == 'string'){ // server side only convention... not compatible with Cr client side... so not really useful,however json format event lister is string only...and needs work...
			if( isAttrEvent ){
				//embed in document onevent="listener"
			}else{
				// embed in client side JS attach listener?? 
			}
		}else{
			// assume function exist server side and client side?
			// server side any object with name property will do, need not be function server side to work
			// var myListener = {name: "myListener"};
			// Cr.evt('click', myListener) found in event/s attribute
			// results in attribute onclick="myListener(event)"
			if( listener.name ){ // named function

				this.setAttribute(onEvent, listener.name+'(event);');

			}else{
				// annon function / unnamed (var) function

				var listenerStr = listener.toString();

				// strategy
				// 1) escape all single quotes found within NON ESCAPED double quotes
				// 2) turn all double quotes into single quotes

				if( listenerStr.indexOf('"') > -1  ){
					//console.error("Whoah there Neo, that anonymous or unnamed function can't be an onEVENT because it contains doublequotes.  You provided:\n\n" + listenerStr)
					//return;

					// even though the strategy does not necessarily result in functional javascript...
					// it still results in a sound dom hierarchy so we use it anyway for now (if we don't return above)
					var quoParts = listenerStr.split('"');
					for( var q = 1, l=quoParts.length; q<l; q+=2){
						quoParts[q] = quoParts[q].replace(/'/g,"\\'");
						if( quoParts[q].match(/\\$/) ){ // the double quote we are within is not truly terminated since it ends with an escape
							q -= 1; continue; // move back by one so that we advance by one instead of two
						}
					}
					listenerStr = quoParts.join("'");
				}

				this.setAttribute(onEvent, '('+listenerStr+')(event);');
			}
		}
	};

	this.appendChild = this.__fragment.appendChild;

	this.insertBefore = this.__fragment.insertBefore;

	this.removeChild = this.__fragment.removeChild;

	this.__innerHTML = this.__fragment.__innerHTML;

	this.__empty = this.__fragment.__empty;

	this.cache = this.__fragment.cache;

	this.__canInlineSlashify = function(){
		return inlineSlashifiable[this.localName];
	};

	this.__attribHTML = function(){
		var a, o = [], k;
		for( k in this.attributes ){
			a = this.attributes[k]
			if( a || a===false || a==='' ) o.push(k+'="'+a+'"');
		}
		if( o.length ) return ' '+o.join(' ');
		return '';
	};

	this.__outerHTML = function(){
		var insideHtml = this.__innerHTML();
		if( !insideHtml.length && this.__canInlineSlashify() ){
			return '<' + this.localName + this.__attribHTML() + '/>';
		}
		return '<' + this.localName + this.__attribHTML() + '>' + insideHtml + '</' + this.localName + '>';
	};

	this.__classes = function(){
		return (this.attributes.class || this.attributes.className || "").split(' ');
	};

	this.__classesMap = function(){
		return __toKeys(this.__classes());
	};

	this.__hasAllClasses = function(classesMap){
		var classes = this.__classes();
		var foundClasses = {}, found=0;
		for( var n=0,l=classes.length; n<l; n++ ){
			if( classesMap[classes[n]] && !foundClasses[classes[n]]){
				foundClasses[classes[n]] = true;
				found++;
			}
		}
		return Object.keys(classesMap).length == found;
	};

	this.__hasAllAttributes = function(attribMap){
		for( var k in attribMap ){
			if( !this.attributes[k] || (attribMap[k] && !this.attributes[k].match(attribMap[k])) ) return false;
		}
		return Object.keys(attribMap).length || true;
	};

	this.matches = function(selectorString){
		__matches(this, selectorString);
	}

	this.__matchesSelectorComponent = function(selector){
		// all selector must match, selector should really not be empty!
		// when no selector component is specified, match SHOULD be false !
		if( selector.type && this.localName != selector.type ){
			return false;
		}
		if( selector.id && this.attributes.id != selector.id ){
			return false;
		}
		if( selector.classes && !this.__hasAllClasses(selector.classes) ){
			return false;
		}
		if( selector.attributes && !this.__hasAllAttributes(selector.attributes) ){
			return false;
		}
		return true;
	}

	Object.defineProperty(this, "lastChild", Object.getOwnPropertyDescriptor(this.__fragment, 'lastChild'));

	Object.defineProperty(this, "nodeValue", Object.getOwnPropertyDescriptor(this.__fragment, 'nodeValue'));

	Object.defineProperty(this, "innerHTML", Object.getOwnPropertyDescriptor(this.__fragment, 'innerHTML'));

	Object.defineProperty(this, "outerHTML",{
		get: this.__outerHTML
	});

	Object.defineProperty(this, "classList",{
		get: this.__classes
	});

};

var Cr_text = function(t){
	this.text = t;
	this.nodeType = 3; // could define getter only

	this.__outerHTML = function(){ return this.text; };

	this.__setText = function(t){ this.text=t; };

	this.__matchesSelectorComponent = function(){ return false; }

	Object.defineProperty(this, "outerHTML",{
		get: this.__outerHTML,
		set: this.__setText
	});

	Object.defineProperty(this, "innerHTML",{
		get: this.__outerHTML,
		set: this.__setText
	});

	Object.defineProperty(this, "nodeValue",{
		get: this.__outerHTML,
		set: this.__setText
	});
};


var Cr_document = function(){
	this.__doctype="<!DOCTYPE html>\n";
	this.nodeType = 9; // could define getter only
	this.createElement = function(n){
		return new Cr_element(n);
	};
	this.createTextNode = function(t){
		return new Cr_text(t);
	};
	this.createDocumentFragment = function(){
		return new Cr_fragment();
	};
	this.body = this.createElement('body');
	this.head = this.createElement('head');
	this.html = this.createElement('html');
	this.html.appendChild(this.head);
	this.html.appendChild(this.body);
	this.querySelector = this.html.querySelector;
	this.querySelectorAll = this.html.querySelectorAll; // this is not quite right, since we could match html, but works for normal usage
	this.__outerHTML = function(){
		return this.__doctype+this.html.outerHTML;
	};
	Object.defineProperty(this, "outerHTML",{
		get: this.__outerHTML
	});
	Object.defineProperty(this, "doctype",{
		get: function(){return this.__doctype.replace(/\n$/,'');},
		set: function(t){this.__doctype=t?t+"\n":"";}
	});
};

module.exports = Cr_document;
