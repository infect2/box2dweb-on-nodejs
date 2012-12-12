var http = require("http");
var pWorker = require("./physicsWorker.js");
var workerURL;


function onRequest(request, response) {
	var url = decodeURI( request.url ),
		start = url.indexOf("?") + 1,
		end = url.indexOf("&callback"),
		data = JSON.parse( url.slice( start, end ) );
	console.log( data );
	if( data["command"] === "startWorker" ) {
		pWorker.workerInitialize( data["canvasWidth"], data["canvasHeight"], data["timeStep"] );
	} else if( data["command"] === "createWorker" ) {
		workerURL = data["url"];
		// pWorker = require( workerURL );
	} else if( data["command"] === "stopImmediately" )
	{
		pWorker.workerTerminate();
	} else {
		pWorker.setEntities( data );
	}

	response.writeHead(200, {"Content-Type": "application/javascript"});
	response.write('remoteWorkerJSONPCallback( { msg: "good"} )');
	response.end();
}

http.createServer(onRequest).listen(8888);