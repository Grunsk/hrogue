function Scene_Boot() {
  this.init.apply(this, arguments);
}

Scene_Boot.prototype = Object.create(Scene_Base.prototype);
Scene_Boot.prototype.constructor = Scene_Boot;

Scene_Boot.prototype.init = function() {
  Scene_Base.prototype.init.call(this);
  // Load base asset list
  this._loading = [];
  var file = Loader.loadJSON("assets", "assets/list.json");
  file.onLoad.addOnce(this._loadAssets, this);
}

Scene_Boot.prototype._loadAssets = function() {
  var list = Cache.getJSON("assets");
  Loader.onLoad.addOnce(this.start, this);
  // Load JSON
  for(var a = 0;a < list.json.length;a++) {
    var data = list.json[a];
    var obj = Loader.loadJSON(data.key, data.src);
    this._loading.push(obj);
  }
  // Load audio
  for(var a = 0;a < list.audio.length;a++) {
    var data = list.audio[a];
    var obj = Loader.loadAudio(data.key, data.src);
    this._loading.push(obj);
  }
  // Load images
  for(var a = 0;a < list.images.length;a++) {
    var data = list.images[a];
    var obj = Loader.loadImage(data.key, data.src);
    this._loading.push(obj);
  }
  // Load texture atlases
  for(var a = 0;a < list["texture-atlases"].length;a++) {
    var data = list["texture-atlases"][a];
    var obj = Loader.loadImage(data.key, data.src);
    this._loading.push(obj);
  }
}

Scene_Boot.prototype.start = function() {
  AudioManager.playMusic("bgmMainTheme");
}
