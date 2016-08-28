function Core() {}

Core.start = function() {
  this.initMembers();
  this.initElectron();
  this.initPixi();
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
  this.renderer = new PIXI.WebGLRenderer(this.resolution.x, this.resolution.y);
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
