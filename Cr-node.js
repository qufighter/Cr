var document = require('./DOM/Cr_document.js')();

var Cr = require('./Cr.js')(document);

Cr.ent = Cr.txt; //since server side text nodes can contain entities, while cr.ent still works, using cr.txt is faster

//module.exports = {Cr:Cr, document:document};
// not sure what's best to do here... need Cr and destinations such as document.body and document.head to make elements, and document.html.outerHTML to render full output to client
// Cr.doc does exist... Cr.doc.head and Cr.doc.body and Cr.doc.html.outerHTML can be used, so perhaps we will just
module.exports = Cr;

// If you'ure using your own document wrapper, suggest you directly import Cr in your code instead of this file, providing document for initialization:
// var Cr = require('./node_modules/Cr/Cr.js')(document);
