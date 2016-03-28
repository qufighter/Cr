/* */
if(typeof Cr == 'undefined'){var Cr = {};} // typically this should be included after Cr and it should be defined... this is for node/require

var elmShortcuts = ['a','div','span'];
var textShortcuts = ['text'];

for( var e=0,l=elmShortcuts.length; e<l; e++ ){
	Cr[elmShortcuts[i]] = function(attributes,addchilds,appnedTo){
		Cr.elm(elmShortcuts[i], attributes,addchilds,appnedTo);
	}
}

for( var e=0,l=textShortcuts.length; e<l; e++ ){ // someday appendChild("string") may work
	Cr[textShortcuts[i]] = function(text){
		Cr.txt(text);
	}
}
