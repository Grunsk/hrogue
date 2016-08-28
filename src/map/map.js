function Game_Map() {
  this.init.apply(this, arguments);
}

Game_Map.prototype.init = function() {
  this.initMembers();
}

Game_Map.prototype.initMembers = function() {
  this.layer = {
    floor: new Layer_Tile(),
    walls: new Layer_Tile()
  };
}
