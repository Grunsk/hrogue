function Layer() {
  this.init.apply(this, arguments);
}

Layer.prototype.init = function() {
  this.initMembers();
}

Layer.prototype.initMembers = function() {
  this.map = null;
  this.data = [];
}
