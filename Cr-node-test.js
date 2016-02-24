//usage: node Cr-node-test.js

var CrDocument = require('./DOM/Cr-document.js');
var document = new CrDocument();
// var Cr = require('./Cr.js')(document);
// Cr.ent = Cr.txt; //since server side text nodes can contain entities, while cr.ent still works, using cr.txt is faster
var Cr = require('./Cr-node.js')(document);



/**** some tests ********/

var elm1 = Cr.elm('div',{class:'cssrules'},[
	Cr.elm('a',{'href':'#freshLinks'},[Cr.txt('Click Me '), Cr.ent('&nbsp;')])
],document.body);

var link2 = Cr.elm('a',{'href':'#link2'},[
	Cr.txt("You Know What to Do!"),
	Cr.elm('br'),
	Cr.txt("Make text")
],elm1);

Cr.insertNode(link2, document.body, elm1);

Cr.elm('title',{},[
	Cr.txt("Document Title")
],document.head);

var headerFrag = Cr.frag([
	Cr.elm("script",{src:"Cr.js"}),
	Cr.elm("script",{src:"Cr-json.js"}),
	Cr.elm("link",{href:"test.css", type:'text/css', rel:'stylesheet'})
]);

document.head.appendChild(headerFrag);

document.doctype="<!DOCTYPE html>";

//Cr.empty(headerFrag);
//Cr.empty(elm1);

console.log(document.outerHTML);
