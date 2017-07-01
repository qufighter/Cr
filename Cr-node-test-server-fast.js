//usage: node Cr-node-example-server.js
// then
//visit: http://localhost:8080/
// or
///run: ab -n 1000 -c 10 http://127.0.0.1:8080/

//Lets require/import the HTTP module
var http = require('http');

//Lets define a port we want to listen to
const PORT=8080;

function fullTime(startTime){
	var curTime = process.hrtime(/*startTime*/);
	var sec = curTime[0] - startTime[0];
	var ns = curTime[1] - startTime[1];
	console.log([sec + (ns / 1e9), sec, ns]);
	return curTime;
}

// for "fast mode" we will create the document once and share between requests
var Cr = require('./Cr-node.js')(); // you may just require('create-elements')() - handled by Cr-node.js
var document = Cr.doc;

// keep references to any element you need to interact with.  there is no document.getElementById or anything that will bloat Cr-document (does include querySelectorAll) - though the case for enhancing certain features, like cloneNode is strong.
var topTextNode = Cr.txt();
var topSpan = Cr.elm('span',{'id':'pathHit1'},[topTextNode]);

Cr.elm('div',{},[Cr.txt('It Works!! Path Hit: '),topSpan],document.body);

var elm1 = Cr.elm('div',{class:'cssrules'},[
	Cr.elm('a',{'href':'#freshLinks'},[Cr.txt('Click Me '), Cr.ent('&nbsp;'), Cr.ent('&bull;')]).cache() // bet you almost didn't see the cache() call here, which renders <a> element as HTML stored in a text node, to avoid doing so each request
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
	// Cr.elm("script",{src:"Cr.js"}),
	// Cr.elm("script",{src:"Cr-json.js"}),
	// Cr.elm("link",{href:"test.css", type:'text/css', rel:'stylesheet'})
]);

document.head.appendChild(headerFrag);

//console.log(document.head.childNodes); // to see that fragments not really treated normally, see notes in Cr-document.js Cr_fragment.appendChild

document.doctype="<!DOCTYPE html>"; // the default doctype is <!DOCTYPE html>

var bottomDivText = Cr.txt('Text from previous request');
var bottomDiv = Cr.elm('div',{},[bottomDivText],document.body);



//We need a function which handles requests and send response
function handleRequest(request, response){
	if( request.url != '/' ){response.end("EOF");return;}

	//var startTime = process.hrtime();

	// unlike normal mode which starts with a fresh document,
	// first you may want to clone the document... a regular object clone should work... as long as you interact with the document synchronously and render it in one step, it should be relatively safe to modify

	// Cr.empty(topSpan);
	// Cr.insertNode(Cr.txt(request.url), topSpan);

	//topSpan.innerHTML = request.url + " hello there"; //or simply this

	topTextNode.nodeValue=request.url;

	topSpan.attributes.style="color:green;";

	// setTimeout(function(){
	// 	Cr.elm('div',{},[Cr.txt('Rogue Thread: ' + request.url)],document.body); // just to prove how it works
	// 	// the shared document can be modified by any request... powerful... but tricky to manage
	// 	// for example, if a given request handler forgets to change the document.head's title element
	// 	// the title that will appear will be the random title that was set by a different request
	// 	// to avoid such pollution, a fresh document.head could be appended with each request (with default title)
	// 	// or for top performance, document.head can be over-written with a clone of the original (clone is not yet a built in feature of Cr-document though)
	// },1);

	//setTimeout(function(){

		//Cr.empty(bottomDiv);
		//Cr.insertNode(Cr.txt('It Works!! Path Hit: ' + request.url), bottomDiv)

		bottomDivText.nodeValue = 'It Works!! Path Hit: ' + request.url;

		//startTime = fullTime(startTime);

		response.end(document.outerHTML);

		//fullTime(startTime);
	//},5)
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
	//Callback triggered when server is successfully listening. Hurray!
	console.log("Server listening on: http://localhost:%s", PORT);
});
