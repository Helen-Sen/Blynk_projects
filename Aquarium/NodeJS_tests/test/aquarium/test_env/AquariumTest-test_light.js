var Mocha = require('mocha');
var mocha = new Mocha({});

global.deviceUnderTestingConfig = require("../../../common/config/devices.js").getAquariumTestConfig();
global.deviceUnderTestingTemplate = require("../../../common/config/devices.js").getAquariumTemplateConfig();

mocha.addFile('./test/aquarium/test_light.js');
mocha.run();