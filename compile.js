var data = {
  sources: [
    "src/header.js",

    "src/basic/alarm.js",
    "src/basic/alarm-manager.js",
    "src/basic/point.js",
    "src/basic/rect.js",
    "src/basic/signal.js",
    "src/basic/animation.js",

    "src/input/input.js",
    "src/input/input-key.js",
    "src/input/input-mouse.js",

    "src/core.js",

    "src/loader/cache.js",
    "src/loader/loader.js",

    "src/managers/audiomanager.js",
    "src/managers/scenemanager.js",
    "src/managers/savemanager.js",
    "src/managers/options.js",

    "src/scenes/base.js",
    "src/scenes/boot.js",

    "src/sprites/base.js",

    "src/game-objects/base.js",

    "src/map/map.js",
    "src/map/layer-base.js",
    "src/map/layer-tile.js",
    "src/map/tileset.js",
    "src/map/tile.js",
    "src/map/world.js",
    "src/map/camera.js",

    "src/footer.js"
  ],
  target: "lib/game.js"
};

var concat = require("concatenate-files");
concat(data.sources, data.target, { separator: "\n" }, function(err, result) {
  if(err) console.log(err);
} );
