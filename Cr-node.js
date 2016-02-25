"use strict";

var CrInit = require('./Cr.js');
var CrDocument = require('./DOM/Cr-document.js');

var Cr = CrInit(null); // this init won't set Cr.doc, we can still over-ride some default functionality though
Cr.ent = Cr.txt; // since server side text nodes can contain entities, while Cr.ent still works, using Cr.txt is faster
//Cr.unescapeHtml = function(s){return s;} // Cr.ent uses this function, another way to remove performance penalty

// if you have other Cr extensions to run... write your own wrapper instead of using this file, anticipate this pattern:
// require('./node_modules/create-elements/Cr-json.js')(Cr); // should work with npm installation
//Cr = require('./Cr-json.js')(Cr); // tested working, to always extend with json support
//require('./Cr-json.js')(Cr); // also tested working

module.exports = function(doc){
	Cr = CrInit(doc || new CrDocument());
	return Cr;
};

// If you're using your own document wrapper, suggest you directly import Cr in your code instead of this file, providing document for initialization:
// var document = new (require('./node_modules/create-elements/DOM/Cr-document.js'));
// var Cr = require('./node_modules/create-elements/Cr.js')(document);
// further suggest initialization outside of the request cycle, though you will probably need an empty/new document for each request, if you can avoid it, it might perform pretty well.
