var Mocha = require("mocha");
var mocha = new Mocha({});

global.deviceUnderTestingConfig = require("../../../common/config/devices.js").getAquarium1TestConfig;
global.deviceUnderTestingTemplate = require("../../../common/config/devices.js").getAquariumTemplateConfig;
global.doubleSwitcherConfig = require("../../../common/config/devices.js").getDoubleSwitcher1Config;
global.doubleSwitcherTemplate = require("../../../common/config/devices.js").getDoubleSwitcherTemplateConfig;

mocha.addFile("./test/aquarium/test_pump.js");
mocha.run();
