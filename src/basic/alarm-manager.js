function AlarmManager() {
  this.init.apply(this, arguments);
}

AlarmManager.prototype.init = function() {
  this.alarms = {};
}

AlarmManager.prototype.update = function() {
  for(var a in this.alarms) {
    var alarm = this.alarms[a];
    alarm.update();
  }
}

AlarmManager.prototype.add = function(name) {
  this.alarms[name] = new Alarm();
  return this.alarms[name];
}

AlarmManager.prototype.get = function(name) {
  return this.alarms[name];
}
