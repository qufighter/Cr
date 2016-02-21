"use strict";

var y = true;
var inlineSlashifiable = {'hr':y,'br':y,'link':y,'meta':y,'input':y}

var Cr_fragment = function(ownerNode){
	ownerNode = ownerNode || this; // owner node should basically never be provided except for internal usage... once the fragment is inserted however, each elements parent node could be updated
	this.childNodes = [];
	this.parentNode = false;

	this.appendChild = function(c){
		// c is suppose to be a node, but it could be a fragment too... since fragments render like regular HTML its not really distinguishable server side
		// if c is a fragment.... we might do things a little differently
		// we could append each child node in that case... since each element in the fragment will have the wrong parentNode (fragment itself)
		// ideally if c is a fragment, we might just append the whole fragment as a single child node still, but update the parentNode on each to be ownerNode
		// what we have now works, but traversing the hierarchy that contains fragments will not work exactly the way you would expect it to work client side at this time, since each fragment is "one node".
		if( c.parentNode ) c.parentNode.removeChild(c);
		c.parentNode = ownerNode;
		this.childNodes.push(c);
		return c;
	};

	this.insertBefore = function(c,b){
		for( var n=0,l=this.childNodes.length; n<l; n++ ){
			if( this.childNodes[n] === b ){
				if( c.parentNode ) c.parentNode.removeChild(c);
				c.parentNode = ownerNode;
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

	this.__outerHTML = function(){
		return this.__innerHTML();
	};

	this.__innerHTML = function(){
		var childHtml = '';
		for( var n=0,l=this.childNodes.length; n<l; n++ ){
			childHtml+=this.childNodes[n].__outerHTML();
		}
		return childHtml;
	}

	this.__empty = function(){
		while(this.lastChild) this.removeChild(this.lastChild);
	}

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
	this.__fragment = new Cr_fragment(this); // the fragment contains all the child nodes... several node properties exist on the fragment for convenience
	this.childNodes = this.__fragment.childNodes;
	this.parentNode = this.__fragment.parentNode;
	this.attributes = {};

	this.setAttribute = function(key, val){
		this.attributes[key] = val;
	};

	this.getAttribute = function(key){
		return this.attributes[key];
	};

	this.addEventListener = function(event, listener, captrue){
//http://stackoverflow.com/questions/18002799/running-multiple-files-on-node-js-at-the-same-time
//http://nodejs.org/api/modules.html

		attrEvent = event.substr(0,2) == 'on';

		//TO IMPLEMENT - two modes?
		if( typeof(listener) == 'string'){
			if( attrEvent ){
				//embed in document onevent="listener"
			}else{
				// embed in client side JS attach listener?? 
			}
		}else{
			// assume function exist server side and client side?
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
		var o = [];
		for( var k in this.attributes ){
			o.push(k+'="'+this.attributes[k]+'"')
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

	Object.defineProperty(this, "lastChild", Object.getOwnPropertyDescriptor(this.__fragment, 'lastChild'));

	Object.defineProperty(this, "nodeValue", Object.getOwnPropertyDescriptor(this.__fragment, 'nodeValue'));

	Object.defineProperty(this, "outerHTML", Object.getOwnPropertyDescriptor(this.__fragment, 'outerHTML'));

	Object.defineProperty(this, "innerHTML", Object.getOwnPropertyDescriptor(this.__fragment, 'innerHTML'));

};

var Cr_text = function(t){
	this.text = t;

	this.__outerHTML = function(){
		return this.text;
	};

	this.__setText = function(t){ this.text=t; }

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
}

module.exports = Cr_document;
