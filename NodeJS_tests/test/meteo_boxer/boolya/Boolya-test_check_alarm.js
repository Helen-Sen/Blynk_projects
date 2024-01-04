var Mocha = require("mocha");
var mocha = new Mocha({});

global.deviceUnderTestingConfig = require("../../../common/config/devices.js").getBoolyaConfig;
global.deviceUnderTestingTemplate = require("../../../common/config/devices.js").getMeteoBoxerTemplateConfig;
global.doubleSwitcherConfig = require("../../../common/config/devices.js").getDoubleSwitcher2Config;
global.doubleSwitcherTemplate = require("../../../common/config/devices.js").getDoubleSwitcherTemplateConfig;

mocha.addFile("./test/meteo_boxer/test_check_alarm.js");
mocha.run();
