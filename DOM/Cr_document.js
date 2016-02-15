var Cr_fragment = function(){ // element really inherits from fragment
	this.childNodes = [];
	this.parentNode = false;

	this.appendChild = function(c){
		if( c.parentNode ) c.parentNode.removeChild(c);
		c.parentNode = this;
		this.childNodes.push(c);
		return c;
	};

	this.insertBefore = function(c,b){
		for( var n=0,l=this.childNodes.length; n<l; n++ ){
			if( this.childNodes[n] === b ){
				if( c.parentNode ) c.parentNode.removeChild(c);
				c.parentNode = this;
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
			this.childNodes = [document.createTextNode(t)]; // warning: global document used
		}
	});

};


var Cr_element = function(n){ // should probably just inherit from fragment, and override __outerHTML
	this.localName = n;
	this.childNodes = [];
	this.parentNode = false;
	this.attributeMap = {};

	this.setAttribute = function(key, val){
		this.attributeMap[key] = val;
	};

	this.getAttribute = function(key){
		return this.attributeMap[key];
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

	this.appendChild = function(c){
		if( c.parentNode ) c.parentNode.removeChild(c);
		c.parentNode = this;
		this.childNodes.push(c);
		return c;
	};

	this.insertBefore = function(c,b){
		for( var n=0,l=this.childNodes.length; n<l; n++ ){
			if( this.childNodes[n] === b ){
				if( c.parentNode ) c.parentNode.removeChild(c);
				c.parentNode = this;
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

	this.__canInlineSlashify = function(){
		var y = true;
		var yesMap = {'hr':y,'br':y,'link':y,'meta':y,'input':y}
		return yesMap[this.localName];
	};

	this.__attribHTML = function(){
		var o = [];
		for( var k in this.attributeMap ){
			o.push(k+'="'+this.attributeMap[k]+'"')
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

	this.__innerHTML = function(){
		var childHtml = '';
		for( var n=0,l=this.childNodes.length; n<l; n++ ){
			childHtml+=this.childNodes[n].__outerHTML();
		}
		return childHtml;
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
			this.childNodes = [document.createTextNode(t)]; // warning: global document used
		}
	});

};

var Cr_text = function(t){
	this.text = t;

	this.__outerHTML = function(){
		return this.text;
	};

	Object.defineProperty(this, "outerHTML",{
		get: this.__outerHTML
	});

	Object.defineProperty(this, "innerHTML",{
		get: this.__outerHTML
	});

	Object.defineProperty(this, "nodeValue",{
		get: this.__outerHTML
	});
};


var Cr_document = function(){
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
}

var document = new Cr_document();

module.exports = function(){return document;};
