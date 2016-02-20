"use strict";

var CrInit = require('./Cr.js');
var CrDocument = require('./DOM/Cr-document.js');

var Cr = CrInit(null); // this init is to attempt to pin all calls to Cr.ent to Cr.txt
Cr.ent = Cr.txt; // since server side text nodes can contain entities, while Cr.ent still works, using Cr.txt is faster

// if you have other Cr extensions to run... write your own wrapper, anticipate this pattern:
// require('./node_modules/Cr/Cr-json.js')(Cr);
//Cr = require('./Cr-json.js')(Cr); // tested working

module.exports = function(doc){
	Cr = CrInit(doc || new CrDocument());
	return Cr;
};

// If you're using your own document wrapper, suggest you directly import Cr in your code instead of this file, providing document for initialization:
// var document = new require('./node_modules/Cr/DOM/Cr-document.js');
// var Cr = require('./node_modules/Cr/Cr.js')(document);
// further suggest initialization outside of the request cycle, though you will probably need an empty/new document for each request.
