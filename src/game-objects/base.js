function GameObject() {
  this.init.apply(this, arguments);
}

GameObject.prototype.init = function() {
  this.initMembers();
}

GameObject.prototype.initMembers = function() {
  this.sprite = null;
  this.position = new Point();
}
