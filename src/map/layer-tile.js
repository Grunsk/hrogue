function Layer_Tile() {
  this.init.apply(this, arguments);
}

Layer_Tile.prototype = Object.create(Layer.prototype);
Layer_Tile.prototype.constructor = Layer_Tile;

Layer_Tile.prototype.init = function() {
  Layer.prototype.init.call(this);
}

Layer_Tile.prototype.clear = function() {
  this.data = [];
  while(this.data.length < this.map.width * this.map.height) this.data.push(null);
}

Layer_Tile.prototype.initMembers = function() {
  Layer.prototype.initMembers.call(this);
}

Layer_Tile.prototype.getIndex = function(position) {
  if(position.x < 0 || position.x > this.map.width || position.y < 0 || position.y > this.map.height) return null;
  return (position.x * this.map.width) + position.y;
}

Layer_Tile.prototype.getPosition(index) {
  if(index < 0 || index > this.map.width * this.map.height) return null;
  return new Point(index % this.map.width, Math.floor(index / this.map.width));
}

Layer_Tile.prototype.replace = function(position, object) {
  var index = this.getIndex(position);
  if(index) {
    return this.data.splice(a, 1, object)[0];
  }
  return null;
}
