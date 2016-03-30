"use strict";

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

module.exports = {

	nextSelector: function(selectors){
		var selector = {classes:{}, attributes: {}, nextSelectorCombinator: null}, sstr, ncomb, ncombType, scmp, components, type, mapType, val;


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
	},

	parseSelectors: function(selectors){
		var nextSelector = this.nextSelector(selectors), allSelectors = [];
		while(nextSelector){
			allSelectors.push(nextSelector.selector);
			nextSelector = this.nextSelector(nextSelector.remaining);
		}
		return allSelectors;
	},

	querySelectorAll: function(node, selectors, selectorIndex){
		var matchedNodes = [], parentSelector, selectorComponent, nextSelectorComponent, nextNextSelectorComponent, nextChildNode;  // these nodes matched top level selector... need to probably verify they match full query before adding

		if( !node.childNodes ) return matchedNodes;

		selectors = typeof selectors === 'string' ? this.parseSelectors(selectors) : selectors; // selectors may already be parsed

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
									matchedNodes = matchedNodes.concat( this.querySelectorAll(nextChildNode, selectors, selectorIndex+2) );
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
						matchedNodes = matchedNodes.concat( this.querySelectorAll(node.childNodes[n], selectors, selectorIndex+1) );
					}
				}else{
					matchedNodes.push(node.childNodes[n]); // we are on the final selector, and it matched!
				}
			}
			if( parentSelector.nextSelectorCombinator == 'descendant' ){ // this check for querySelectorAll should PROBABLY happen at top of this function, check node has childNodes ?
				matchedNodes = matchedNodes.concat( this.querySelectorAll(node.childNodes[n], selectors, selectorIndex) );
			}
		}
		return matchedNodes;
	},

	matches: function(node, selectors){
		selectors = typeof selectors === 'string' ? this.parseSelectors(selectors) : selectors; // selectors may already be parsed
		// native matches could be cool,
		// since this may consider parent nodes!
		// and the element must really match the final selector
		// sure we could just call document.querySelectorAll and return the matching node from that set if found
		// but what is the fun in that!
	}
};
