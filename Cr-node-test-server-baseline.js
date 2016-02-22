//usage: node Cr-node-example-server.js
// then
//visit: http://localhost:8080/
// or
///run: ab -n 1000 -c 10 http://127.0.0.1:8080/

//Lets require/import the HTTP module
var http = require('http');

//Lets define a port we want to listen to
const PORT=8080;

//We need a function which handles requests and send response
function handleRequest(request, response){
	if( request.url != '/' ){response.end("EOF");return;}

	setTimeout(function(){
		response.end("hello world");
	},5)
}

//Create a server
var server = http.createServer(handleRequest);

//Lets start our server
server.listen(PORT, function(){
	//Callback triggered when server is successfully listening. Hurray!
	console.log("Server listening on: http://localhost:%s", PORT);
});
