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
	var ns = curTime[1] - startTime[1]
	console.log([sec + (ns / 1e9), sec, ns]);
	return curTime;
}

//We need a function which handles requests and send response
function handleRequest(request, response){

	if( request.url != '/' ){response.end("EOF");return;}
	//var startTime = process.hrtime();

	var Cr = require('./Cr-node.js')(); // you may just require('create-elements')() - handled by Cr-node.js
	var document = Cr.doc; // Cr is somewhat static, for normal duration of use (render time), the document will be available here.
	// Cr only uses its internal this.doc.body as a default/fallback if at all, otherwise only uses create node functions
	// you may provide your own document when you require Cr

	// Cr.empty(document.head); // if your doc persists between requests, you are probably doing something wrong, but you can empty it
	// Cr.empty(document.body); // instead you might prefer what is found in Cr-node.js see line 16

	Cr.elm('div',{},[Cr.txt('It Works!! Path Hit: ' + request.url)],document.body);

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
		// Cr.elm("script",{src:"Cr.js"}),
		// Cr.elm("script",{src:"Cr-json.js"}),
		// Cr.elm("link",{href:"test.css", type:'text/css', rel:'stylesheet'})
	]);

	document.head.appendChild(headerFrag);

	document.doctype="<!DOCTYPE html>" // the default doctype

	//setTimeout(function(){
		Cr.elm('div',{},[Cr.txt('It Works!! Path Hit: ' + request.url)],document.body);

		//startTime = fullTime(startTime);


		response.end(document.outerHTML);


		//fullTime(startTime);

	//},1000)
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
	//Callback triggered when server is successfully listening. Hurray!
	console.log("Server listening on: http://localhost:%s", PORT);
});
