var SCALE = 30;

function Entity(id, x, y) {
  this.id = id;
  this.x = x;
  this.y = y;
  this.angle = 0;
}

Entity.prototype.update = function(state) {
  this.x = state.x;
  this.y = state.y;
  this.angle = state.a;
}

Entity.prototype.draw = function(ctx) {
  ctx.fillStyle = 'black';
  ctx.beginPath();
  ctx.arc(this.x * SCALE, this.y * SCALE, 2, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
}

function CircleEntity(id, x, y, radius) {
  Entity.call(this, id, x, y);
  this.radius = radius;
}
CircleEntity.prototype = new Entity();
CircleEntity.prototype.constructor = CircleEntity;

CircleEntity.prototype.draw = function(ctx) {
  ctx.fillStyle = 'blue';
  ctx.beginPath();
  ctx.arc(this.x * SCALE, this.y * SCALE, this.radius * SCALE, 0, Math.PI * 2, true);
  ctx.closePath();
  ctx.fill();
  
  Entity.prototype.draw.call(this, ctx);
}

function RectangleEntity(id, x, y, halfWidth, halfHeight) {
  Entity.call(this, id, x, y);
  this.halfWidth = halfWidth;
  this.halfHeight = halfHeight;
}
RectangleEntity.prototype = new Entity();
RectangleEntity.prototype.constructor = RectangleEntity;

RectangleEntity.prototype.draw = function(ctx) {
  ctx.save();
  ctx.translate(this.x * SCALE, this.y * SCALE);
  ctx.rotate(this.angle);
  ctx.translate(-(this.x) * SCALE, -(this.y) * SCALE);
  ctx.fillStyle = 'red';
  ctx.fillRect((this.x-this.halfWidth) * SCALE,
               (this.y-this.halfHeight) * SCALE,
               (this.halfWidth*2) * SCALE,
               (this.halfHeight*2) * SCALE);
  ctx.restore();
  
  Entity.prototype.draw.call(this, ctx);
}

function randomEntity(id) {
  var x = Math.random() * 20;
  var y = Math.random() * 10;
  
  if (Math.random() > 0.5) {
    return new CircleEntity(id, x, y, Math.random() + 0.1);
  } else {
    return new RectangleEntity(id, x, y, Math.random() + 0.1, Math.random() + 0.1);
  }
}