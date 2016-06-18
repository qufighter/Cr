//usage: node Cr-node-example-server.js
// then
//visit: http://localhost:8080/
// or
///run: ab -n 1000 -c 10 http://127.0.0.1:8080/

//Lets require/import the HTTP module
var http = require('http');
var fs = require('fs');

//Lets define a port we want to listen to
const PORT=8080;

function fullTime(startTime){
	var curTime = process.hrtime(/*startTime*/);
	var sec = curTime[0] - startTime[0];
	var ns = curTime[1] - startTime[1];
	console.log([sec + (ns / 1e9), sec, ns]);
	return curTime;
}

//We need a function which handles requests and send response
function handleRequest(request, response){

	if( request.url == '/Cr.js'){
		fs.readFile('Cr.js', {}, function(err, text){
			response.end(text);
		});
		return;
	}

	if( request.url != '/' ){response.end("EOF");return;}
	//var startTime = process.hrtime();

	var Cr = require('./Cr-node.js')(); // you may just require('create-elements')() - handled by Cr-node.js
	var document = Cr.doc; // Cr is somewhat static, for normal duration of use (render time), the document will be available here.
	// Cr only uses its internal this.doc.body as a default/fallback if at all, otherwise only uses create node functions
	// you may provide your own document when you require Cr

	require('./Cr-json.js')(Cr); // extend Cr with JSON support


	var CrJSONstring='{"elm":["div",{"style":"color:red"},[{"txt":["Hello World"]}],"document.body"]}';
	var node_s=Cr.fromJsonString(CrJSONstring);
	Cr.insertNodes(node_s,document.body);

	var nodes = Cr.fromJsonObject(
		{elm:[
			"h1",{
				//event:['click','doStuff'],   // TODO fix events from json formats too
				style:"color:pink;",
				childNodes:[
					{txt:["Cr.elm - innerHTML be Gone!"]}
				]
			}
			// ,[
			// 	{txt:["Cr.elm - innerHTML be Gone 2!"]} // childNodes attribute renders 3rd argument ignored when using fromJsonObject
			// ]
		]}
	);


	Cr.insertNode(nodes, document.body);
	//document.body.appendChild(jsonNode);

	nodes = Cr.fromJson(
		{
			div:{
				style:'color:blue;',
				childNodes:[
					{div: {
						//event:['click','doStuff'],   // TODO fix events from json formats too
						childNodes:[
							{txt: "fun text here"},
						]
					}},
					{txt: "fun text here"},
					{hr: {}}
				]
			}
		}
	);

	Cr.insertNode(nodes, document.body);

	function clickFunctionTest(){
		//its readl!
	}

	nodes = Cr.fromJson({div:{
		style:"color:black;",
		childNodes:[
			{h1:{
				childNodes:[
					{text:"Cr.elm - innerHTML be Gone!"}
				]
			}},
			{img:{
				src:"../Cr.png",
				"class":"ie reserved word test",
				"var":"ie reserved word test",
				"var2":'quote "test" ><',
				alt:"Javascript CreateElement Library Cr.elm",
				style:"float:right;height:67px;width:500px;",
				events:[["click",clickFunctionTest]]
			}},
			{h3:{
				childNodes:[
					{text:"Simplifying document.createElement"}
				]
			}},
			{text:"Imagine you have to create a bunch of elements using javascript.  Go ahead imagine it, I'll wait.  Sure you could just use .innerHTML, or you could use JQuery .html - however then your HTML code string must be parsed into elements."},
			{br:{}},
			{br:{}},
			{text:"For the sake of elegance and simplicity and \"correct\" attachment of events you should be using document.createElement then document.body.appendChild; EXCEPT what a god awful amount of writing and lines of code and space that takes up."},
			{br:{}},
			{br:{}},
			{text:"Instead using the elm function of the Cr library one can create and nest nodes with ease!"},
			{br:{}},
			{br:{}}
		]
	}});
	Cr.insertNode(nodes, document.body);


	//this function that exists server side, would attempt to attach these events... if the dom supported addEventListener, though the exact strategy for attachment may be onEVENTS
	//var redOnMouseOver=function redOnMouseOver(ev){ // IMPORTANT - named function only (like this), following are tests of un-named functions that work/don't work
	var redOnMouseOver=function(ev){ // unnamed function!!! will be attached as annon fn
		ev.target.style.color="red";console.log("test string with\" nea't\" stuff")// double quotes in function will cause problems, use named function instead
	};
	// var redOnMouseOver=function(ev){ // unnamed function!!! will be attached as annon fn
	// 	ev.target.style.color='red';// double quotes in function will cause problems
	// };
	//var redOnMouseOver=function(ev){ev.target.style.color='red';};
	Cr.elm('div',{
		style: 'color:grey;border:1px solid red;border-radius:3px;padding:10px;margin:5px;',
		title: "About: childNodes as an attribute.",
		childNodes:[
			Cr.txt('If you would rather specify childNodes as an attribute, '),
			Cr.txt('which provides some more readable nesting options, this is also now supported.  '),
			Cr.elm('br'),
			Cr.elm('span',{
				style: 'color:black;cursor:crosshair;',
				events: Cr.events(
					Cr.event('mouseover',redOnMouseOver),
					Cr.event('mouseout',function(ev){ev.target.style.color='black';})
				),
				childNodes:[
					Cr.txt('When doing so, the third argument must be omitted.  Please "view source" (!!! client generation side only, since this was generated SERVER side see the file being served, Cr-node-test-server.js !!!) to see how this statement is generated')
				]
			})
		]
	},document.body);


	// Cr.empty(document.head); // if your doc persists between requests, you are probably doing something wrong, but you can empty it
	// Cr.empty(document.body); // instead you might prefer what is found in Cr-node.js see line 16

	Cr.elm('div',{},[Cr.txt('It Works!! Path Hit: ' + request.url)],document.body);

	var elm1 = Cr.elm('div',{class:'cssrules'},[
		Cr.elm('a',{'href':'#freshLinks'},[Cr.txt('Click Me '), Cr.ent('&nbsp;')])
	],document.body);

	// some crazy ideas about classList support, rather classes.join(' ') unless the impl can be exactly like native support;
	// elm1.classList.add('red').remove('red');
	// console.log(elm1.classList._get());

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
		// Cr.elm("script",{src:"Cr-json.js"}),
		// Cr.elm("link",{href:"test.css", type:'text/css', rel:'stylesheet'})
		Cr.elm('script',{},[Cr.txt("function clickFunctionTest(){alert('ok');};")])
	]);

	document.head.appendChild(headerFrag);

	document.doctype="<!DOCTYPE html>"; // the default doctype

	string1 = '2Hello World2'
	var div = Cr.elm('div', {
	  style: "color:blue;",
	  childNodes: [Cr.txt(string1)]
	});

	document.body.appendChild(div);
	//Cr.insertNode(div, document.body);



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
