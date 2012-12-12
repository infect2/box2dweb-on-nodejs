;
var remoteworker = (function(global){
    function extend(dest, src){
        for (var i in src) {
            dest[i] = src[i];
        }
    }
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
                if (jqXHR.status == "200" ) {
                } else if(jqXHR.status == "401") {
                    alert("error 401: Unauthorized");
                } else if(jqXHR.status == "403") {
                    alert("error 403: Forbidden");
                } else if (jqXHR.status == "404") {
                    alert("error 404: Not Found");
                } else if (jqXHR.status == "412") {
                    alert("error 412: Precondition Failed ");
                } else if (jqXHR.status == "500") {
                    alert("error 500: Internal Server Error");
                } else {
                    alert("error " + jqXHR.status ); 
                }
            }
        } );            
    }
   
    function RemoteMessageEvent(worker){
    }
    RemoteMessageEvent.prototype = {
    };
 
    var nativeWorker = global["Worker"];
    var RemoteWorker = function(url){
        var request = serverURL + "/remoteWorker?" + JSON.stringify( { command: "createWorker", url: "physicsWorker.js" } );
        
        sendViaAJAX(request);
    };
    RemoteWorker.prototype = {
        postMessage: function(msg){
            var json = JSON.stringify( msg ),
                request = serverURL + "/remoteWorker?" + json;

            sendViaAJAX( request );
        },
        terminate: function(){
        }
    };
    
    var ret = {
        nativeWorker: nativeWorker,
        install: function(){
            global["Worker"] = RemoteWorker;
            global["remoteWorkerJSONPCallback"] = function( msg ) {
                console.log( "remoteWorkerJSONPCallback" );
            }
        },
        uninstall: function(){
            global["Worker"] = nativeWorker;
        }
    };
    return ret;
})(window);