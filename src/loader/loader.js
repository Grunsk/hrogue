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
