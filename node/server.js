//module loading
var http = require("http"),
	sockjs = require("sockjs"),
	pWorker = require("./physicsWorker.js");
//server configuration
var	httpServer,
	httpServerPort = 8888,
	workerURL,
	sockConnection;
//physics engine configuration
var canvasWidth,
	canvasHeight,
	timeStep;

var sockjs_opts = {sockjs_url: "http://cdn.sockjs.org/sockjs-0.3.min.js"};
var sockjs_echo = sockjs.createServer( sockjs_opts );
sockjs_echo.on( 'connection', function( conn ) {
	sockConnection = conn;
	pWorker.setConnection( conn );
	pWorker.workerInitialize( canvasWidth, canvasHeight, timeStep );
});

function onRequest(request, response) {
	var ret,
		url = decodeURI( request.url ),
		start = url.indexOf( "?" ) + 1,
		end = url.indexOf( "&callback" ),
		data = JSON.parse( url.slice( start, end ) );
	console.log( data );
	if( data["command"] === "startWorker" ) {
		// pWorker.workerInitialize( data["canvasWidth"], data["canvasHeight"], data["timeStep"] );
		//wait to actually workerInitialize until sockjs connection is established
		canvasWidth = data["canvasWidth"];
		canvasHeight = data["canvasHeight"];
		timeStep = data["timeStep"];
	} else if( data["command"] === "createWorker" ) {
		workerURL = data["url"];
		// pWorker = require( workerURL );
	} else if( data["command"] === "stopImmediately" ) {
		pWorker.workerTerminate();
	} else {
		ret = pWorker.setEntities( data );
		if( !ret ) {//one more try
			setTimeout( function() {
				ret = pWorker.setEntities( data );
				if( !ret ) {
					sockConnection.end();
					process.exit(1);
				}
			}, 1000 );
		}
	}

	response.writeHead(200, {"Content-Type": "application/javascript"});
	response.write('remoteWorkerJSONPCallback( { msg: "node operation ok"} )');
	response.end();
}

httpServer = http.createServer(onRequest).listen( httpServerPort );
sockjs_echo.installHandlers( httpServer, { prefix:'/world' } );