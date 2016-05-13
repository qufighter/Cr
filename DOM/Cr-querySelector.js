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
	'~=' : function(v){return new RegExp('^'+v+'\\s|\\s'+v+'\\s|\\s'+v+'$|^'+v+'$');},
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
		//console.log(val, k,c,v)
		s.attributes[k] = comparitors[c](v); // we.match(v) if its truthy (if falsey, we allow the attribute basedon presense of key)
	}
}

module.exports = {

	nextSelector: function(selectors){
		var selector = {classes:{}, attributes: {}, nextSelectorCombinator: null}, sstr, astr, selectorString, ncomb, ncombType, scmp, acmp, scmparr, components, type, mapType, val;

		// todo use some strategy to avoid quotes, a strategy in Cr-document.js addEventListener is not ideal but could work
		// matches only first attribute 'div[class~="fun"]'.match(/^[^ >~+[]+[\[]?[^=~|^$*]*[=~|^$*]{0,2}[^ >~+]*/)
		//sstr = selectors.match(/^[^ >~+]+/); // TODO: warning [key="quoted"] attrib selector may contain these though [also anywhere inside brackets can contain ~]

		sstr = selectors.match(/^[^ >~+\[]+/); // non attribute selectors
		if( !sstr || sstr.length != 1 ) return false;
		sstr = sstr[0]; //!!!!

		astr = selectors.substr(sstr.length).match(/^([\[]{1}[^\[\]]+[\]]{1})+/g); // grab attribute selectors if present - we do not allow [] in quotes but everything else goes
		if( !astr || astr.length != 1 ) astr = [""];
		astr = astr[0];


		selectorString = sstr+astr;

		ncomb = selectors.substr(selectorString.length).match(/^[ >~+]+/);
		//console.log(sstr, ncomb);
		if( ncomb && ncomb.length ){
			ncomb = ncomb[0];
			ncombType = ncomb.replace(/ /g, '');
			selector.nextSelectorCombinator = combinators[ncombType];
		}else{
			ncomb = "";
		}

		//scmparr= selectorString.match(/[.#\[]?[^.#\[\]]+[\]]?/g); // matches both selector and attrib selector.... too generic since attrb could contain quoted selector chars
		scmp = sstr.match(/[.#]?[^.#]+/g);
		acmp = astr.match(/[\[]{1}[^\[\]]+[\]]{1}/g); // we do not allow [] in quotes at this time
		if( !acmp ) acmp = [];

		scmparr = scmp.concat(acmp);

		for( var i=0,l=scmparr.length; i<l; i++ ){
			components = scmparr[i].match(/^([.#\[]?)([^\]]+)/);
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

		return {selector:selector, remaining: selectors.substr(selectorString.length + ncomb.length) };
	},

	parseSelectors: function(selectors){
		var nextSelector = this.nextSelector(selectors), allSelectors = [];
		while(nextSelector){
			allSelectors.push(nextSelector.selector);
			nextSelector = this.nextSelector(nextSelector.remaining);
		}
		return allSelectors;
	},

	// todo: this can probably be transformed into a recursive generator function* to better support querySelect1
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
		var matches = true; // because we match empty selector
		for( var s=selectors.length-1; s>-1; s-- ){
			matches = node.__matchesSelectorComponent(selectors[s]);
			if( !matches ) break; // we should count matches instead, since matched nodes form basis for nextNodes
			// but if we do match... node moves some distance up parentNode (multiple arbatrary distances) tree (only 1 if >)
			// or up the parentNode.childNodes tree if sibing selector
			// so nodes is always an array of possible matching nodes that can be eliminated
			// but a new set of nextNodes is always generated for subsequent iteration of s loop
			// and if nextNodes.length is zero but we have more selectors to match, our node does not match
			// if nextNodes.length and s==0 then we matched all selectors and return true
		}
		return matches;
	}
};
