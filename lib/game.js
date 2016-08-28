var $gameMap = null;

function Alarm() {
  this.init.apply(this, arguments);
}

Object.defineProperties(Alarm.prototype, {
  time: {
    get: function() { return this._time; },
    set: function(value) { this._time = Math.max(-1, Math.floor(value)); }
  },
  baseTime: {
    get: function() { return this._baseTime; },
    set: function(value) {
      this._baseTime = Math.max(-1, Math.floor(value));
      if(this._baseTime === 0) this._baseTime = -1;
    }
  }
});

Alarm.prototype.init = function() {
  this._time = -1;
  this._basetime = -1;
  this.onExpire = new Signal();
}

Alarm.prototype.update = function() {
  this.time--;
  if(this.time === 0) {
    this.onExpire.dispatch();
    if(this.baseTime > 0 && this.time === 0) this.time = this.baseTime;
  }
}

Alarm.prototype.stop = function() {
  this.time = -1;
}

Alarm.prototype.start = function(time) {
  if(!time) time = -1;
  if(time > 0) this.time = time;
  else if(time === -1 && this.baseTime > 0) this.time = this.baseTime;
}

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

function Point() {
  this.init.apply(this, arguments);
}

Point.prototype = Object.create(PIXI.Point.prototype);
Point.prototype.constructor = Point;

Point.prototype.init = function(x, y) {
  PIXI.Point.prototype.constructor.call(this, x, y);
}

Point.prototype.clone = function() {
  return new Point(this.x, this.y);
}

function Rect() {
  this.init.apply(this, arguments);
}

Rect.prototype = Object.create(PIXI.Rectangle.prototype);
Rect.prototype.constructor = Rect;

Object.defineProperties(Rect.prototype, {
  left: {
    get: function() { return this.x; },
    set: function(value) { this.x = value; }
  },
  top: {
    get: function() { return this.y; },
    set: function(value) { this.y = value; }
  },
  right: {
    get: function() { return this.x + this.width; },
    set: function(value) { this.width = value - this.x; }
  },
  bottom: {
    get: function() { return this.y + this.height; },
    set: function(value) { this.height = value - this.y; }
  }
});

Rect.prototype.init = function(x, y, w, h) {
  PIXI.Rectangle.prototype.constructor.call(this, x, y, w, h);
}

Rect.prototype.overlap = function(rect) {
  return ((rect.right > this.left && rect.left < this.right) &&
  (rect.bottom > this.top && rect.top < this.bottom));
}

Rect.prototype.clone = function() {
  return new Rect(this.x, this.y, this.width, this.height);
}

function Signal() {
  this.initialize.apply(this, arguments);
}

Signal.prototype.initialize = function() {
  this._bindings = [];
}

Signal.prototype.add = function(callback, context, args, priority) {
  if(args === undefined) args = [];
  if(priority === undefined) priority = 50;
  this._bindings.push({
    callback: callback,
    context: context,
    args: args,
    once: false,
    priority: priority
  });
}

Signal.prototype.addOnce = function(callback, context, args, priority) {
  if(!args) args = [];
  if(!priority && priority !== 0) priority = 50;
  this._bindings.push({
    callback: callback,
    context: context,
    args: args,
    once: true,
    priority: priority
  });
}

Signal.prototype.remove = function(callback, context) {
  for(var a = 0;a < this._bindings.length;a++) {
    var obj = this._bindings[a];
    if(obj.callback === callback && obj.context === context) {
      this._bindings.splice(a, 1);
      return true;
    }
  }
  return false;
}

Signal.prototype.sortFunction = function(a, b) {
  if(a.priority < b.priority) return -1;
  if(a.priority > b.priority) return 1;
  return 0;
}

Signal.prototype.dispatch = function(params) {
  var binds = [];
  for(var a = 0;a < this._bindings.length;a++) {
    var bind = this._bindings[a];
    if(bind.once) {
      this._bindings.splice(a, 1);
      a--;
    }
    binds.push(bind);
  }
  binds = binds.sort(this.sortFunction);
  for(var a = 0;a < binds.length;a++) {
    var bind = binds[a];
    if(params) bind.callback.apply(bind.context, params);
    else bind.callback.apply(bind.context, bind.args);
  }
}

function Animation() {
  this.init.apply(this, arguments);
}

Animation.prototype.init = function(key) {
  this.key = key;
  this.frames = [];
  this.onEnd = new Signal();
}

Animation.prototype.addFrame = function(atlasKey, frameKey) {
  var atlas = Cache.getTextureAtlas(atlasKey);
  if(atlas) {
    var frame = atlas[frameKey];
    if(frame) {
      this.frames.push(frame);
    }
  }
  return this;
}

function Input() {}

Input.init = function() {
  this.initKeys();
  this.initActions();
  this.mouse = new Input_Mouse();
  this.initListeners();
}

Input.initKeys = function() {
  var keys = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
  "ARROWLEFT", "ARROWRIGHT", "ARROWUP", "ARROWDOWN",
  "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12",
  "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=",
  "ALT", "CONTROL", "SHIFT", "ENTER", "SPACE",
  "NUM1", "NUM2", "NUM3", "NUM4", "NUM5", "NUM6", "NUM7", "NUM8", "NUM9", "NUM0"];

  this.key = {};
  for(var a = 0;a < keys.length;a++) {
    var k = keys[a];
    this.key[k] = new Input_Key(k);
  }
}

Input.initActions = function() {
  this._actions = {
    moveLeft: ["ARROWLEFT", "NUM4"],
    moveRight: ["ARROWRIGHT", "NUM6"],
    moveUp: ["ARROWUP", "NUM8"],
    moveDown: ["ARROWDOWN", "NUM2"],
    moveUpLeft: ["NUM7"],
    moveUpRight: ["NUM9"],
    moveDownLeft: ["NUM1"],
    moveDownRight: ["NUM3"],
    skipTurn: ["SPACE"]
  };
}

Input.isDown = function(action) {
  var action = this._actions[action];
  if(action) {
    for(var a = 0;a < action.length;a++) {
      var key = action[a];
      if(this.key[key].down) return true;
    }
  }
  return false;
}

Input.isPressed = function(action) {
  var action = this._actions[action];
  if(action) {
    for(var a = 0;a < action.length;a++) {
      var key = action[a];
      if(this.key[key].pressed) return true;
    }
  }
  return false;
}

Input.isReleased = function(action) {
  var action = this._actions[action];
  if(action) {
    for(var a = 0;a < action.length;a++) {
      var key = action[a];
      if(this.key[key].released) return true;
    }
  }
  return false;
}

Input._refreshButtonStates = function() {
  for(var a in this.key) {
    var k = this.key[a];
    k.pressed = false;
    k.released = false;
  }
  for(var a in this.mouse.button) {
    var mb = this.mouse.button[a];
    mb.pressed = false;
    mb.released = false;
  }
}

Input._onKeyDown = function(e) {
  var key = this.key[this.getKey(e)];
  if(key && !key.down) {
    key.down = true;
    key.pressed = true;
    key.onPress.dispatch();
  }
}

Input._onKeyUp = function(e) {
  var key = this.key[this.getKey(e)];
  if(key && key.down) {
    key.down = false;
    key.released = true;
    key.onRelease.dispatch();
  }
}

Input.getKey = function(e) {
  var keyName = e.key.toUpperCase();
  switch(keyName) {
    case "0":
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      if(e.location === 3) keyName = "NUM" + keyName;
      break;
    case " ":
      keyName = "SPACE";
      break;
  }
  return keyName;
}

Input._onMouseMove = function(e) {
  this.mouse.onMove.dispatch([e]);
}

Input._onMouseDown = function(e) {
  var btn = null;
  if(e.button === 0) btn = "LEFT";
  else if(e.button === 1) btn = "MIDDLE";
  else if(e.button === 2) btn = "RIGHT";
  if(btn && !this.mouse.button[btn].down) {
    this.mouse.button[btn].down = true;
    this.mouse.button[btn].pressed = true;
    this.mouse.button[btn].onPress.dispatch();
  }
}

Input._onMouseUp = function(e) {
  var btn = null;
  if(e.button === 0) btn = "LEFT";
  else if(e.button === 1) btn = "MIDDLE";
  else if(e.button === 2) btn = "RIGHT";
  if(btn && this.mouse.button[btn].down) {
    this.mouse.button[btn].down = false;
    this.mouse.button[btn].released = true;
    this.mouse.button[btn].onRelease.dispatch();
  }
}

Input._wheel = function(e) {
  var btn = null;
  if(e.deltaY < 0) btn = "WHEELUP";
  else if(e.deltaY > 0) btn = "WHEELDOWN";
  if(btn) {
    this.mouse.button[btn].onPress.dispatch();
  }
}

Input.initListeners = function() {
  // Core events
  window.addEventListener("keydown", this._onKeyDown.bind(this));
  window.addEventListener("keyup", this._onKeyUp.bind(this));
  Core.renderer.view.addEventListener("mousemove", this._onMouseMove.bind(this));
  Core.renderer.view.addEventListener("mousedown", this._onMouseDown.bind(this));
  Core.renderer.view.addEventListener("mouseup", this._onMouseUp.bind(this));
  Core.renderer.view.addEventListener("wheel", this._wheel.bind(this));
  // Misc events
  this.key.F4.onPress.add(function() {
    this.setFullscreen(!this.getFullscreen());
  }, Core);
  this.key.ENTER.onPress.add(function() {
    if(Input.key.Alt.down) {
      this.setFullscreen(!this.getFullscreen());
    }
  }, Core);
};

function Input_Key() {
  this.init.apply(this, arguments);
}

Input_Key.prototype.init = function(key) {
  this._key = key;
  this.down = false;
  this.pressed = false;
  this.released = false;
  this.onPress = new Signal();
  this.onRelease = new Signal();
}

function Input_Mouse() {
  this.init.apply(this, arguments);
}

Input_Mouse.prototype.init = function() {
  this.button = {
    LEFT: {
      down: false,
      pressed: false,
      released: false,
      onPress: new Signal(),
      onRelease: new Signal()
    },
    MIDDLE: {
      down: false,
      pressed: false,
      released: false,
      onPress: new Signal(),
      onRelease: new Signal()
    },
    RIGHT: {
      down: false,
      pressed: false,
      released: false,
      onPress: new Signal(),
      onRelease: new Signal()
    },
    WHEELUP: {
      down: false,
      pressed: false,
      released: false,
      onPress: new Signal(),
      onRelease: new Signal()
    },
    WHEELDOWN: {
      down: false,
      pressed: false,
      released: false,
      onPress: new Signal(),
      onRelease: new Signal()
    }
  };
  this.position = {
    screen: {
      x: 0,
      y: 0
    },
    world: {
      x: 0,
      y: 0
    }
  };
  this.onMove = new Signal();
  this.onMove.add(this.updatePosition, this, [], 100);
}

Input_Mouse.prototype.updatePosition = function(e) {
  this.position.screen.x = Math.floor(e.clientX * Core.hRes);
  this.position.screen.y = Math.floor(e.clientY * Core.vRes);
  if($gameMap && $gameMap.active && $gameMap.active.world) {
    this.position.world.x = Math.floor(e.clientX * Core.hRes / $gameMap.world.scale.x) + $gameMap.camera.rect.left;
    this.position.world.y = Math.floor(e.clientY * Core.vRes / $gameMap.world.scale.y) + $gameMap.camera.rect.top;
  }
}

function Core() {}

Core.start = function() {
  this.initMembers();
  this.initElectron();
  this.initPixi();
  Input.init();
  Options.generate();
  SaveManager.generate();

  SceneManager.push(new Scene_Boot());
  this.render();
}

Core.initMembers = function() {
  this.frameRate = 60;
  this.resolution = new Point(1280, 720);
}

Core.initElectron = function() {
  this.usingElectron = false;
  if(typeof require === "function") {
    this.usingElectron = true;
    this.ipcRenderer = require("electron").ipcRenderer;
    this.fs = require("fs");
    this.initElectronProperties();
  }
}

Core.initElectronProperties = function() {
  window.addEventListener("resize", Core.onResize);
}

Core.initPixi = function() {
  // this.renderer = new PIXI.WebGLRenderer(this.resolution.x, this.resolution.y);
  this.renderer = new PIXI.autoDetectRenderer(this.resolution.x, this.resolution.y);
  document.body.appendChild(this.renderer.view);
  if(this.usingElectron) {
    this.resizeWindow(this.resolution.x, this.resolution.y);
    this.centerWindow();
  }
}

Core.onResize = function(e) {
  Core.fitToWindow();
}

Core.fitToWindow = function() {
  Core.renderer.view.style.width = window.innerWidth.toString() + "px";
  Core.renderer.view.style.height = window.innerHeight.toString() + "px";
}

Core.resizeWindow = function(w, h) {
  if(Core.usingElectron) {
    var diffW = window.outerWidth - window.innerWidth;
    var diffH = window.outerHeight - window.innerHeight;
    Core.ipcRenderer.send("window", ["resize", w + diffW, h + diffH]);
  }
}

Core.centerWindow = function() {
  if(Core.usingElectron) {
    Core.ipcRenderer.send("window", ["center"]);
  }
}

Core.render = function() {
  window.setTimeout(this.render.bind(this), Math.floor(1000 / this.frameRate));

  var scene = SceneManager.current();
  if(scene) scene.render();
}

function Cache() {}

Cache._json = {};
Cache._audio = {};
Cache._images = {};
Cache._textureAtlases = {};

Cache.getJSON = function(key) {
  if(this._json[key]) return this._json[key];
  return null;
}

Cache.addJSON = function(key, obj) {
  this._json[key] = obj;
}

Cache.removeJSON = function(key) {
  delete this._json[key];
}

Cache.hasJSON = function(key) {
  return (this._json[key] !== undefined);
}

Cache.getAudio = function(key) {
  if(this._audio[key]) return this._audio[key];
  return null;
}

Cache.addAudio = function(key, obj) {
  this._audio[key] = obj;
}

Cache.removeAudio = function(key) {
  var howl = this._audio[key];
  howl.unload();
  delete this._audio[key];
}

Cache.hasAudio = function(key) {
  return (this._audio[key] !== undefined);
}

Cache.getImage = function(key) {
  if(this._images[key]) return this._images[key].clone();
  return null;
}

Cache.addImage = function(key, obj) {
  this._images[key] = obj;
}

Cache.removeImage = function(key) {
  var img = this._images[key];
  img.destroy(true);
  delete this._images[key];
}

Cache.hasImage = function(key) {
  return (this._images[key] !== undefined);
}

Cache.getTextureAtlas = function(key) {
  if(this._textureAtlases[key]) return this._textureAtlases[key].cache;
  return null;
}

Cache.addTextureAtlas = function(key, dataObj) {
  var obj = {};
  for(var a in dataObj.data.frames) {
    var tex = PIXI.utils.TextureCache[a];
    obj[a] = tex;
  }
  this._textureAtlases[key] = { resources: dataObj, cache: obj };
}

Cache.removeTextureAtlas = function(key) {
  // Gather info
  var obj = this._textureAtlases[key];
  var arr = [];
  for(var a in obj.resources.textures) {
    arr.push(obj.resources.textures[a]);
  }
  // Delete textures
  while(arr.length > 0) {
    var obj = arr.shift();
    var destroyBase = false;
    if(arr.length === 0) destroyBase = true;
    obj.destroy(destroyBase);
  }
  // Delete reference
  delete this._textureAtlases[key];
}

Cache.hasTextureAtlas = function(key) {
  return (this._textureAtlases[key] !== undefined);
}

function Loader() {}

Loader._loading = [];
Loader._textureAtlasQueue = [];
Loader.onLoad = new Signal();
Loader.onFileLoad = new Signal();

Loader.loadJSON = function(key, src) {
  if(!src) src = key;
  if(this.isLoading("json", key) || Cache.hasJSON(key)) return null;
  var xobj = new XMLHttpRequest();
  xobj.open("GET", src);
  xobj.onreadystatechange = function() {
    if(xobj.readyState === 4 && xobj.status === 200) { // Done loading
      file.onLoad.dispatch();
    }
    else if(xobj.readyState === 4 && xobj.status !== 200) { // Fail loading
      file.onFail.dispatch();
    }
  }
  xobj.send(null);

  var file = {
    key: key,
    src: src,
    type: "json",
    onLoad: new Signal(),
    onFail: new Signal(),
    dataObject: xobj
  };
  this._loading.push(file);
  file.onLoad.addOnce(this._finishJSON, this, [file], 10);

  return file;
}

Loader.loadAudio = function(key, src) {
  if(!src) src = key;
  if(this.isLoading("audio", key) || Cache.hasAudio(key)) return null;
  var file;
  var howl = new Howl({
    src: [src],
    onload: function() {
      file.onLoad.dispatch();
    }
  });

  file = {
    key: key,
    src: src,
    type: "audio",
    onLoad: new Signal(),
    onFail: new Signal(),
    dataObject: howl
  };
  this._loading.push(file);
  file.onLoad.addOnce(this._finishAudio, this, [file], 10);

  return file;
}

Loader.loadImage = function(key, src) {
  if(!src) src = key;
  if(this.isLoading("image", key) || Cache.hasImage(key)) return null;
  var file;
  var loader = new PIXI.loaders.Loader();
  loader.add(key, src);
  loader.on("complete", function(loader, resources) {
    for(var a in resources) {
      if(file.key === a) {
        file.dataObject = resources[a].texture;
        file.onLoad.dispatch();
        break;
      }
    }
  });

  file = {
    key: key,
    src: src,
    type: "image",
    onLoad: new Signal(),
    onFail: new Signal(),
    dataObject: null
  };
  this._loading.push(file);
  file.onLoad.addOnce(this._finishImage, this, [file], 10);
  loader.load();

  return file;
}

Loader.loadTextureAtlas = function(key, src) {
  if(!src) src = key;
  if(this.isLoading("textureAtlas", key) || Cache.hasTextureAtlas(key)) return null;
  var file;
  var loader = new PIXI.loaders.Loader();
  loader.add(key, src);
  loader.on("complete", function(loader, resources) {
    for(var a in resources) {
      if(a === file.key) file.dataObject = resources[a];
      if(a === file.key || a === file.key + "_image") {
        file.remaining--;
        if(file.remaining <= 0) file.onLoad.dispatch();
      }
    }
  });

  file = {
    key: key,
    src: src,
    type: "textureAtlas",
    onLoad: new Signal(),
    onFail: new Signal(),
    dataObject: null,
    remaining: 2
  };
  this._loading.push(file);
  file.onLoad.addOnce(this._finishTextureAtlas, this, [file], 10);
  loader.load();

  // Add to queue
  this._textureAtlasQueue.push(file);

  return file;
}

Loader._finishJSON = function(file) {
  Cache.addJSON(file.key, JSON.parse(file.dataObject.responseText));
  this._finishFile(file);
}

Loader._finishAudio = function(file) {
  Cache.addAudio(file.key, file.dataObject);
  this._finishFile(file);
}

Loader._finishImage = function(file) {
  Cache.addImage(file.key, file.dataObject);
  this._finishFile(file);
}

Loader._finishTextureAtlas = function(file) {
  Cache.addTextureAtlas(file.key, file.dataObject);
  this._finishFile(file);
}

Loader._finishFile = function(file) {
  var a = this._loading.indexOf(file);
  if(a !== -1) {
    var obj = this._loading.splice(a, 1);
    this.onFileLoad.dispatch([obj]);
  }
  this.checkLoadCompletion();
}

Loader._startLoadingTextureAtlas = function(queueObj) {
}

Loader.checkLoadCompletion = function() {
  if(this._loading.length === 0) this.onLoad.dispatch();
}

Loader.determineKey = function(url) {
  return url;
}

Loader.isLoading = function(type, key) {
  for(let a = 0;a < this._loading.length;a++) {
    var file = this._loading[a];
    if(file.key === key && file.type === type) return true;
  }
  return false;
}

function AudioManager() {}

AudioManager._music = null;
AudioManager._sounds = [];

AudioManager.playMusic = function(key) {
  this.stopMusic();
  var snd = Cache.getAudio(key);
  if(snd) {
    this._music = { audio: snd, id: 0, channel: "music", paused: false };
    this._music.id = this._music.audio.play();
    this._music.audio.volume(Options.data.audio.volume.music, this._music.id);
    this._sounds.push(this._music);
    return this._music;
  }
  return null;
}

AudioManager.stopMusic = function() {
  if(this._music) this._music.audio.stop(this._music.id);
  this._music = null;
}

AudioManager.pauseMusic = function() {
  if(this._music) {
    this._music.audio.pause(this._music.id);
    this._music.paused = true;
  }
}

AudioManager.resumeMusic = function() {
  if(this._music && this._music.paused) {
    this._music.audio.play(this._music.audio.id);
    this._music.paused = false;
  }
}

AudioManager.playSound = function(key) {
  var snd = Cache.getAudio(key);
  if(snd) {
    var sndObj = { audio: snd, id: snd.play(), channel: "snd" };
    snd.volume(Options.data.audio.volume.sfx, sndObj.id);
    this._sounds.push(sndObj);
    sndObj.audio.once("end", this._onSoundEnd.bind(this, sndObj));
    return sndObj;
  }
  return null;
}

AudioManager.baseDir = function(type) {
  if(type.toUpperCase() === "music") return "assets/audio/music/";
  return "assets/audio/sfx/";
}

AudioManager.setVolume = function(channel, volume) {
  volume = Math.max(0, Math.min(1, volume));
  Options.data.audio.volume[channel] = volume;
  for(var a = 0;a < this._sounds.length;a++) {
    var snd = this._sounds[a];
    if(snd.channel === channel) snd.audio.volume(volume, snd.id);
  }
}

AudioManager._onSoundEnd = function(snd) {
  var a = this._sounds.indexOf(snd);
  if(a !== -1) this._sounds.splice(a, 1);
}

function SceneManager() {}

SceneManager._stack = [];

SceneManager.push = function(scene) {
  var currentScene = this.current();
  if(currentScene) currentScene.leave();
  this._stack.push(scene);
  scene.create();
}

SceneManager.pop = function() {
  var scene = this._stack.pop();
  scene.leave();
  scene.end();
  this.current().continue();
}

SceneManager.current = function() {
  if(this._stack.length === 0) return null;
  return this._stack.slice(-1)[0];
}

SceneManager.update = function() {
  if(this.current()) this.current().update();
}

SceneManager.render = function() {
  if(this.current()) this.current().render();
}

function SaveManager() {}

SaveManager.data          = null;
SaveManager.SAVE_LOCATION = "save.json";
SaveManager.onSave        = new Signal();
SaveManager.onLoad        = new Signal();

SaveManager.generate = function() {
  this.data = {};
  this.data.mapCompletion = {};
}

SaveManager.addMapCompletion = function(world, key, completion) {
  if(!this.data.mapCompletion[world]) {
    this.data.mapCompletion[world] = {};
  }
  this.data.mapCompletion[world][key] = completion;
  this.save();
}

SaveManager.getMapCompletion = function(world, key) {
  return (this.data.mapCompletion[world] && this.data.mapCompletion[world][key] === true);
}

SaveManager.save = function() {
  var json = JSON.stringify(this.data);
  if(Core.usingElectron) {
    Core.fs.writeFile(SaveManager.SAVE_LOCATION, json, {}, function() {
      this.onSave.dispatch();
    }.bind(this));
  }
  else {
    localStorage.setItem("save", json);
    this.onSave.dispatch();
  }
}

SaveManager.load = function() {
  this.generate();
  if(Core.usingElectron) {
    Core.fs.readFile(SaveManager.SAVE_LOCATION, {}, function(err, data) {
      if(!err) this.data = Object.assign(this.data, JSON.parse(data));
      this.onLoad.dispatch();
    }.bind(this));
  }
  else {
    var data = localStorage.getItem("save");
    if(data) this.data = Object.assign(this.data, JSON.parse(data));
    this.onLoad.dispatch();
  }
}

function Options() {}

Options.data          = null;
Options.SAVE_LOCATION = "config.json";
Options.onSave        = new Signal();
Options.onLoad        = new Signal();

Options.generate = function() {
  this.data = {};
  this.data.audio = {
    volume: {
      music: 0.9,
      sfx: 0.9
    },
    toggleDuringPause: false
  };
  this.data.gameplay = {
    startWithGrid: false
  };
}

Options.save = function() {
  var json = JSON.stringify(this.data);
  if(Core.usingElectron) {
    Core.fs.writeFile(Options.SAVE_LOCATION, json, {}, function() {
      this.onSave.dispatch();
    }.bind(this));
  }
  else {
    localStorage.setItem("config", json);
    this.onSave.dispatch();
  }
}

Options.load = function() {
  this.generate();
  if(Core.usingElectron) {
    Core.fs.readFile(Options.SAVE_LOCATION, {}, function(err, data) {
      if(!err) this.data = Object.assign(this.data, JSON.parse(data));
      this.onLoad.dispatch();
    }.bind(this));
  }
  else {
    var data = localStorage.getItem("config");
    if(data) this.data = Object.assign(this.data, JSON.parse(data));
    this.onLoad.dispatch();
  }
}

function Scene_Base() {
  this.init.apply(this, arguments);
}

Scene_Base.FADEDURATION_DEFAULT = 500;


Scene_Base.prototype.init = function() {
  this.stage = new PIXI.Container();
  this.initFadeScreen();
  this.active = false;
}

Scene_Base.prototype.update = function() {
}

Scene_Base.prototype.render = function() {
  this.stage.children.sort(function(a, b) {
    return b.z - a.z;
  });
  Core.renderer.render(this.stage);
}

Scene_Base.prototype.create = function() {
  this.addListeners();
  this.active = true;
}

Scene_Base.prototype.continue = function() {
  this.addListeners();
  this.active = true;
}

Scene_Base.prototype.leave = function() {
  this.removeListeners();
  this.active = false;
}

Scene_Base.prototype.end = function() {}

Scene_Base.prototype.initFadeScreen = function() {
  this._fadeScreen = new PIXI.Graphics();
  this._fadeScreen.beginFill(0x000000);
  this._fadeScreen.drawRect(0, 0, Core.resolution.x, Core.resolution.y);
  this._fadeScreen.endFill();
  this._fadeScreen.z = -3000;
  this.stage.addChild(this._fadeScreen);
}

Scene_Base.prototype.fadeIn = function(callback) {
  var obj = createjs.Tween.get(this._fadeScreen, { override: true }).to({ alpha: 0 }, Scene_Base.FADEDURATION_DEFAULT).set({ visible: false });
  if(callback) obj.call(callback);
}

Scene_Base.prototype.fadeOut = function(callback) {
  var obj = createjs.Tween.get(this._fadeScreen, { override: true }).set({ visible: true }).to({ alpha: 1 }, Scene_Base.FADEDURATION_DEFAULT);
  if(callback) obj.call(callback);
}

Scene_Base.prototype.addListeners = function() {
  this.removeListeners();
}

Scene_Base.prototype.removeListeners = function() {}

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

function Sprite_Base() {
  this.init.apply(this, arguments);
}

Sprite_Base.prototype = Object.create(PIXI.Sprite.prototype);
Sprite_Base.prototype.constructor = Sprite_Base;

Object.defineProperties(Sprite_Base.prototype, {
  x: {
    get: function() { return this.position.x; },
    set: function(value) { this.position.x = Math.floor(value); }
  },
  y: {
    get: function() { return this.position.y; },
    set: function(value) { this.position.y = Math.floor(value); }
  }
});

Sprite_Base.prototype.init = function(texture) {
  if(!texture) texture = null;
  PIXI.Sprite.prototype.constructor.call(this, texture);
  this.atlasData = null;
  this.animations = {};
  this.animation = null
  this.animFrame = 0;
  this.animSpeed = 1;
  this.z = 0;
}

Sprite_Base.prototype.playAnimation = function(key) {
  if(this.animations[key] && !this.animation || (this.animation && this.animation.name !== key)) {
    this.animation = this.animations[key];
    this.animFrame = 0;
    this.texture = this.animation.frames[Math.floor(this.animFrame)];
    return this.animation;
  }
  return null;
}

Sprite_Base.prototype.addAnimation = function(name) {
  var anim = new Animation(name);
  this.animations[name] = anim;
  return anim;
}

Sprite_Base.prototype.addAnimationExt = function(atlas, name, frames, str) {
  var anim = this.addAnimation(name);
  for(var a = 0;a < frames;a++) {
    anim.addFrame(atlas, str.replace("%s", String(a)));
  }
}

Sprite_Base.prototype.getAnimation = function(key) {
  return this.animations[key];
}

Sprite_Base.prototype.isAnimationPlaying = function(key) {
  return (this.animation === this.animations[key]);
}

Sprite_Base.prototype.hasAnimation = function(key) {
  return (this.animations[key] instanceof Animation);
}

Sprite_Base.prototype.update = function() {
  // Update animation
  if(this.animation) {
    var oldFrame = this.animFrame;
    this.animFrame = (this.animFrame + this.animSpeed) % this.animation.frames.length;
    this.texture = this.animation.frames[Math.floor(this.animFrame)];
    if(oldFrame > this.animFrame) this.animation.onEnd.dispatch();
  }
}

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

function Game_Tileset() {
  this.init.apply(this, arguments);
}

Object.defineProperties(Game_Tileset.prototype, {
  width: {
    get: function() {
      return this.texture.width / (this.tileWidth + this.spacing);
    }
  },
  height: {
    get: function() {
      return this.texture.height / (this.tileHeight + this.spacing);
    }
  }
});

Game_Tileset.prototype.init = function() {
  this.texture = null;
  this.firstGid = 1;
  this.margin = 2;
  this.spacing = 4;
  this.tileWidth = 16;
  this.tileHeight = 16;
  this.tileProperties = null;
}

Game_Tileset.prototype.getCrop = function(index) {
  return new Rect(
    this.margin + (this.tileWidth + this.spacing) * (index % this.width),
    this.margin + (this.tileHeight + this.spacing) * Math.floor(index / this.width),
    this.tileWidth,
    this.tileHeight
  );
}

Game_Tileset.prototype.getTileTexture = function(index) {
  var tex = this.texture.clone();
  tex.frame = this.getCrop(index);
  return tex;
}

Game_Tileset.prototype.getTileProperties = function(index) {
  if(this.tileProperties && this.tileProperties[index.toString()]) return this.tileProperties[index.toString()];
  return null;
}

Game_Tileset.prototype.getTileExtraProperties = function(index) {
  if(this.tiles && this.tiles[index.toString()]) return this.tiles[index.toString()];
  return null;
}

function Game_Tile() {
  this.init.apply(this, arguments);
}

Game_Tile.COLLISION_PASSABLE   = 0;
Game_Tile.COLLISION_IMPASSABLE = 1;
Game_Tile.COLLISION_ENDOFMAP   = 2;
Game_Tile.COLLISION_LIQUID     = 3;

Game_Tile.COLLISIONFUNC_AIR = function(realX, realY) {
  return Game_Tile.COLLISION_PASSABLE;
}
Game_Tile.COLLISIONFUNC_GROUND = function(realX, realY) {
  return Game_Tile.COLLISION_IMPASSABLE;
}
Game_Tile.COLLISIONFUNC_LIQUID = function(realX, realY) {
  return Game_Tile.COLLISION_LIQUID;
}

Game_Tile.PROPERTY_STEEL = Math.pow(2, 0);

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
  this.collisionFunction = Game_Tile.COLLISIONFUNC_GROUND;
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

function Game_World() {
  this.init.apply(this, arguments);
}

Game_World.prototype = Object.create(PIXI.Container.prototype);
Game_World.prototype.constructor = Game_World;

Game_World.prototype.init = function() {
  PIXI.Container.prototype.constructor.call(this);
  this.z = 150;
}

Game_World.prototype.zOrder = function() {
  this.children.sort(function(a, b) {
    return b.z - a.z;
  });
}

function Game_Camera() {
  this.init.apply(this, arguments);
}

Game_Camera.prototype.init = function(map) {
  this.baseRect = new Rect(0, 0, 640, 360);
  this.rect = new Rect(this.baseRect.x, this.baseRect.y, this.baseRect.width, this.baseRect.height);
  this.map = map;
  this.bounds = new Rect(0, 0, this.map.realWidth, this.map.realHeight);
}

Game_Camera.prototype.update = function() {
  this.map.world.scale.x = Core.resolution.x / this.rect.width;
  this.map.world.scale.y = Core.resolution.y / this.rect.height;
  this.map.world.position.x = -(this.rect.x * this.map.world.scale.x);
  this.map.world.position.y = -(this.rect.y * this.map.world.scale.y);
}

Game_Camera.prototype.setPosition = function(position, anchor) {
  // Gather data
  var oldPos = new Point(this.rect.x, this.rect.y);
  var mapPos = new Point(
    Math.max(this.bounds.x, Math.min(this.bounds.right - this.rect.width, position.x - (this.rect.width * anchor.x))),
    Math.max(this.bounds.y, Math.min(this.bounds.bottom - this.rect.height, position.y - (this.rect.height * anchor.y)))
  );
  // Move
  this.rect.x = mapPos.x;
  this.rect.y = mapPos.y;
  // Update background
  this.map.background.refresh();
  // Return data
  var diff = new Point(oldPos.x - this.rect.x, oldPos.y - this.rect.y);
  return diff;
}

Game_Camera.prototype.move = function(x, y) {
  return this.setPosition(new Point(this.rect.x + x, this.rect.y + y), new Point(0, 0));
}

Game_Camera.prototype.contains = function(spr) {
  var r = new Rect(spr.x - (spr.width * spr.anchor.x), spr.y - (spr.height * spr.anchor.y), spr.width, spr.height);
  return this.rect.overlap(r);
}

window.addEventListener("load", Core.start.bind(Core));
