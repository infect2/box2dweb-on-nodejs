//global variables for performance evaluation
var canvasConfig = { //benchmarking configuration
    selector: '#infiniwall ul',
    width: 0,
    height: 0,
    minScale: 0.5,
    maxScale: 1.2,
    hiddenRatio: 0.3
  },
  PEConfig = {//physics engine configuration
    useWokerThread: true,//don't change, it is the initial value
    physicsEngineTimeStep: 1000/60,
    useCircleEntity: true, //force to use CirCleEntity
    maxObjectNum: 5
  },
  animationDriver = {//benchmarking driver
    benchmarkingUnderway: false,
    runAnimation: null,
    stopAnimation: null
  };

//setting canvas to window after excluding canvasInnerMargin if any
canvasConfig.canvasWidth = $( canvasConfig.selector )[0].offsetWidth;
canvasConfig.canvasHeight = $( canvasConfig.selector )[0].offsetHeight;

// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       || 
              window.webkitRequestAnimationFrame || 
              window.mozRequestAnimationFrame    || 
              window.oRequestAnimationFrame      || 
              window.msRequestAnimationFrame     || 
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
})();

var button = document.getElementById( "runButton" );
button.addEventListener( "click", function() {
  if( animationDriver.benchmarkingUnderway ) {
    animationDriver.benchmarkingUnderway = false;
    button.innerHTML = "Run Benchmark";
    animationDriver.stopAnimation();
  } else {
    animationDriver.benchmarkingUnderway = true;
    button.innerHTML = "Stop Benchmark";
    animationDriver.runAnimation();
  }
} );