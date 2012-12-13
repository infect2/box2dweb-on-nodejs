var Box2D = require("./Box2D.js").Box2D;

var   b2Vec2 = Box2D.Common.Math.b2Vec2
 , b2BodyDef = Box2D.Dynamics.b2BodyDef
 , b2Body = Box2D.Dynamics.b2Body
 , b2FixtureDef = Box2D.Dynamics.b2FixtureDef
 , b2Fixture = Box2D.Dynamics.b2Fixture
 , b2World = Box2D.Dynamics.b2World
 , b2MassData = Box2D.Collision.Shapes.b2MassData
 , b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape
 , b2CircleShape = Box2D.Collision.Shapes.b2CircleShape
 , b2DebugDraw = Box2D.Dynamics.b2DebugDraw;

 var responseQueue = [];
var SCALE = 30;

function bTest(intervalRate, adaptive, width, height) {
  this.intervalRate = parseInt(intervalRate);
  this.adaptive = adaptive;

  this.lastTimestamp = Date.now();
  
  this.world = new b2World(
        new b2Vec2(0, 4)    //gravity
     ,  true                 //allow sleep
  );

  this.fixDef = new b2FixtureDef;
  this.fixDef.density = 1.0;
  this.fixDef.friction = 0.5;
  this.fixDef.restitution = 0.5;

  this.bodyDef = new b2BodyDef;

  //create ground
  this.bodyDef.type = b2Body.b2_staticBody;

  // positions the center of the object (not upper left!)
  this.bodyDef.position.x = width / 2 / SCALE;
  this.bodyDef.position.y = (height-150) / SCALE;

  this.fixDef.shape = new b2PolygonShape;

  // half width, half height. eg actual height here is 1 unit
  this.fixDef.shape.SetAsBox(((width+1000) / SCALE) / 2, (10/SCALE) / 2);
  this.world.CreateBody(this.bodyDef).CreateFixture(this.fixDef);
}

bTest.prototype.update = function() {
  var now = Date.now();
  var stepRate = (this.adaptive) ? (now - this.lastTimestamp) / 1000 : (1 / this.intervalRate);
  this.lastTimestamp = now;
  this.world.Step(
         stepRate   //frame-rate
      ,  6       //velocity iterations
      ,  5       //position iterations
   );
  this.world.ClearForces();
  this.sendUpdate();
}

bTest.prototype.sendUpdate = function() {
    var world = {};
    for (var b = this.world.GetBodyList(); b; b = b.m_next) {
        if (typeof b.GetUserData() !== 'undefined' && b.GetUserData() != null) {
            world[b.GetUserData()] = {x: Math.ceil(b.GetPosition().x*SCALE), y: Math.ceil(b.GetPosition().y*SCALE), a: b.GetAngle()};
        }
      }
    postMessage(world);
}

bTest.prototype.setBodies = function(bodyEntities) {
  this.bodyDef.type = b2Body.b2_dynamicBody;
  for(var id in bodyEntities) {
      var entity = bodyEntities[id];
      if (entity.radius) {
          this.fixDef.shape = new b2CircleShape(entity.radius/SCALE);
      } else {
          this.fixDef.shape = new b2PolygonShape;
          this.fixDef.shape.SetAsBox(entity.halfWidth/SCALE, entity.halfHeight/SCALE);
      }
     this.bodyDef.position.x = entity.x/SCALE;
     this.bodyDef.position.y = entity.y/SCALE;
     this.bodyDef.userData = entity.id;
     this.world.CreateBody(this.bodyDef).CreateFixture(this.fixDef);
  }
  this.ready = true;
}

var box,
  loop,
  timerId,
  timeStep,
  connection;

function postMessage ( world ) {
  if( typeof connection === "undefined" ) {
    console.log( "Web Socket is Yet-to-be-prepared");
    return;
  }
  var json = JSON.stringify( world );
  connection.write( json )
}

exports.setConnection = function( conn ){
  connection = conn;
};

exports.workerInitialize = function( width, height, ts ) {
  console.log( "workerInitialize" );
  timeStep = ts;
  box = new bTest(30, false, width, height);
  loop = function() {
      if (box.ready) box.update();
  }
  timerId = setInterval(loop, timeStep);
};

exports.setEntities = function ( data ){
  if( typeof box === "undefined" ) {
    return false;
  }
  box.setBodies(data);
  return true;
};

exports.workerTerminate = function(){
  clearInterval( timerId );
};