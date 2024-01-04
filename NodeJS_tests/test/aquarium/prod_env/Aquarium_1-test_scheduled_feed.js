var Mocha = require("mocha");
var mocha = new Mocha({});

global.deviceUnderTestingConfig = require("../../../common/config/devices.js").getAquarium1TestConfig;
global.deviceUnderTestingTemplate = require("../../../common/config/devices.js").getAquariumTemplateConfig;
global.doubleSwitcherConfig = require("../../../common/config/devices.js").getDoubleSwitcher1Config;

mocha.addFile("./test/aquarium/test_scheduled_feed.js");
mocha.run();
