;
var remoteworker = (function(global){
    var serverURL ="http://localhost:8888";

    function sendViaAJAX(url){
        $.ajax( {
            type : "post",
            url : url,
            jsonpCallback : remoteWorkerJSONPCallback, 
            dataType : "jsonp",
            success : function( msg ) {
                console.log("$.ajax success cb");
            },
            error : function(jqXHR, textStatus, errorThrown){
                console.log( "AJAX error:" + jqXHR.status );
            }
        } );            
    }
   
    var nativeWorker = global["Worker"];
    var RemoteWorker = function(url){
        var that = this;
        var request = serverURL + "/remoteWorker?" + JSON.stringify( { command: "createWorker", url: "physicsWorker.js" } );
        //create WebSocket for full duplex-communcation with server running box2dweb    
        this.sock = new SockJS( serverConfig.nodeServer + "/" + serverConfig.sockJSPrefix );
        this.sock.onopen = function() {
            console.log( "open" );
        };
        this.sock.onmessage = function( e ){
            if( typeof that.onmessage !== "undefined" ) {
                that.onmessage( e );
            } else {
                console.log("no route to redirect onmessage")
            }
        };
        this.sock.onclose = function() {
            console.log("close");
            this.sock = null;
        };
    
        sendViaAJAX(request);
    };
    RemoteWorker.prototype = {
        postMessage: function(msg){
            var json = JSON.stringify( msg ),
                request = serverURL + "/remoteWorker?" + json;

            sendViaAJAX( request );
        },
        terminate: function(){
            this.sock.close();
        }
    };
    
    var ret = {
        nativeWorker: nativeWorker,
        install: function(){
            global["Worker"] = RemoteWorker;
            global["remoteWorkerJSONPCallback"] = function(){
                console.log("remoteWorkerJSONPCallback");
            };
        },
        uninstall: function(){
            global["Worker"] = nativeWorker;
        }
    };
    return ret;
})(window);