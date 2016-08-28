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
