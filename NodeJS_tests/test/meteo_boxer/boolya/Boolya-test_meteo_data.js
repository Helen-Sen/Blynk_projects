var Mocha = require("mocha");
var mocha = new Mocha({});

global.deviceUnderTestingConfig = require("../../../common/config/devices.js").getBoolyaConfig();
global.deviceUnderTestingTemplate = require("../../../common/config/devices.js").getMeteoBoxerTemplateConfig();


mocha.addFile("./test/meteo_boxer/test_meteo_data.js");
mocha.run();
