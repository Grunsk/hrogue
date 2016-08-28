function Game_Tile() {
  this.init.apply(this, arguments);
}

Object.defineProperties(Game_Tile.prototype, {
  x: {
    get: function() { return this.position.x; },
    set: function(value) {
      this.position.x = value;
      if(this.sprite) this.sprite.position.x = value;
    }
  },
  y: {
    get: function() { return this.position.y; },
    set: function(value) {
      this.position.y = value;
      if(this.sprite) this.sprite.position.y = value;
    }
  }
});

Game_Tile.prototype.init = function(texture) {
  this.sprite = new Sprite_Tile(texture);
  this.position = new Point();
  this.property = 0;
}

Game_Tile.prototype.assignProperty = function(name) {
  this.property = this.property | Game_Tile["PROPERTY_" + name.toUpperCase()];
}

Game_Tile.prototype.hasProperty = function(name) {
  return ((this.property & Game_Tile["PROPERTY_" + name.toUpperCase()]) === Game_Tile["PROPERTY_" + name.toUpperCase()]);
}

Game_Tile.prototype.removeProperty = function(name) {
  this.property = this.property & ~(Game_Tile["PROPERTY_" + name.toUpperCase()]);
}

Game_Tile.prototype.update = function() {
  this.sprite.update();
}
