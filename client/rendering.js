var worker, world = {}, worldElement = {}, firstUpdated = false;
var stopAnimationFlag = false;

function createEntity() {
  var cnt = PEConfig.maxObjectNum;
  $( canvasConfig.selector ).find( 'li' ).each( function( index ){
    var x, y,
        translated, translateX, translateY,
        width, height,
        scale,
        element = this,
        $element = $( this ),
        animatable = true;

    if ( Math.random() < canvasConfig.hiddenRatio ) {
      animatable = false;//set visibility:hidden to exclude itself out of animating elements
    } else {
      cnt--;
      if( cnt < 0 ) {
        animatable = false;
      }
    }

    scale = Math.random()*canvasConfig.maxScale;
    if( scale < canvasConfig.minScale ) {
      scale = canvasConfig.minScale;
    }

    translated = (/translate/).test(element.style.cssText);
    translateX = translated ? parseInt( (element.style.cssText).match( /([-]?[\d]+)px/g )[0], 10 ) : 0;
    translateY = translated ? parseInt( (element.style.cssText).match( /([-]?[\d]+)px/g )[1], 10 ) : 0;
    x = translateX + element.offsetLeft;
    y = translateY + element.offsetTop;
    width = (element.offsetWidth/2)*scale;
    height = (element.offsetHeight/2)*scale;

    worldElement[ index ] = {
      element: this,
      x: x,
      y: y,
      angle: 0,
      halfWidth: width,
      halfHeight: height,
      offsetHeight: element.offsetHeight,
      offsetWidth: element.offsetWidth,
      offsetTop: element.offsetTop,
      offsetLeft: element.offsetLeft,
      visibility: element.style.visibility,
      cssText: element.style.cssText,
      animatable: animatable,
      scale: scale
    };

    if( animatable ) {
      if( PEConfig.useCircleEntity ) {
        world[ index ] = new CircleEntity( index, x, y, width /* fake radius */);
      } else {       
        world[ index ] = new RectangleEntity( index, x, y, width , height);
      }
    } else {
      $element.css( "opacity", 0.1 );
    }
  } );
}

function restoreWorldElements() {
  var wElement;
  for (var id in worldElement) {
    wElement = worldElement[id];
    element = wElement.element;
    element.style.cssText = wElement.cssText;
    if( !wElement.animatable ) {
      element.style.visibility = wElement.visibility;
    }
  }
}

function onError() {
  console.log("worker creation error");
}

function createWorker() {
  remoteworker.install();//install fakeworker
  try {
    worker = new Worker('physicsWorker.js');
  } catch( err ){
    console.log(err.message);
  }

  var initMsg = {
    command: "startWorker",
    canvasWidth: canvasConfig.canvasWidth,
    canvasHeight: canvasConfig.canvasHeight,
    timeStep: PEConfig.physicsEngineTimeStep
  }
  worker.postMessage( initMsg );

  worker.postMessage( world );

  worker.onmessage = function(e) {
    firstUpdated = true;
    for (var id in e.data) {
      var entity = world[id];
      if (entity) entity.update(e.data[id]);
    }
  };
}

function destroyWorker() {
  worker.terminate();
  delete worker;
  worker = null;
}

function renderAnimationFrame( id ) {
  var entity = world[ id ],
      wElement = worldElement[ id ];

  wElement.x = Math.ceil( entity.x ) - wElement.element.offsetLeft;
  wElement.y = Math.ceil( entity.y ) - wElement.element.offsetTop;
  wElement.angle = Math.ceil( entity.angle );

  wElement.element.style.cssText = "-webkit-transform: translate(" + wElement.x + "px," + wElement.y + "px) rotateZ(" + wElement.angle + "deg) scale(" + wElement.scale + ");" + " -webkit-transform-origin: center center;";
}

function renderWorldElements( ) {
  if( !firstUpdated ) {
    return;
  }

  for (var id in world) {
    var entity = world[id];
    if( worldElement[id].animatable ) {
      renderAnimationFrame( id );
    }
  }
}

function loop() {
  if( stopAnimationFlag ) {
    return;
  }
  renderWorldElements( false );
  requestAnimFrame(loop);
};

animationDriver.runAnimation = function() {
  stopAnimationFlag = false;
  createEntity();
  createWorker();
  setTimeout( loop, 100 );
};

animationDriver.stopAnimation = function() {
  var stopMsg = {
    command: "stopImmediately"
  }
  stopAnimationFlag = true;
  restoreWorldElements();
  worker.postMessage( stopMsg );
  destroyWorker();
  world = {};
};