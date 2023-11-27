var devices = require("./devices.js");

exports.getTestConfigs = function() {// exports.getTestConfigForAquariumTest = function() {
  let testConfigs = {}; 

  let testLightConfigForAquariumTest = {};
  testLightConfigForAquariumTest["templateConfig"] = devices.getAquariumTemplateConfig();
  testLightConfigForAquariumTest["deviceConfig"] = devices.getAquariumTestConfig();
  testConfigs["test_light-AquariumTest"] = testLightConfigForAquariumTest;

  let testLightConfigForAquarium_1 = {};
  testLightConfigForAquarium_1["templateConfig"] = devices.getAquariumTemplateConfig();
  testLightConfigForAquarium_1["deviceConfig"] = devices.getAquarium1Config();
  testConfigs["test_light-Aquarium_1"] = testLightConfigForAquarium_1;

  return testConfigs;
}

