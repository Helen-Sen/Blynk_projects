// ------------ Aquarium ------------

exports.getAquariumTemplateConfig = function () {
  let vars = {};
  vars["dsLightOnHours"] = "v10";
  vars["dsLightOffHours"] = "v11";
  vars["dsFeedHours"] = "v5";
  vars["dsFeedMinutes"] = "v6";
  vars["dsSensorData"] = "v8";
  vars["dsTimeOffSet"] = "v9";
  vars["dsPumpState"] = "v3";
   vars["dsPumpMode"] = "v1";
  return vars;
};

exports.getAquariumTestConfig = function () {
  let vars = {};
  vars["deviceName"] = "Aquarium test";
  vars["deviceToken"] = "ZFbdiBHXrv_mtYCIn1pBfwKJllf2K706";
  vars["luminosityThreshold"] = 40;
  vars["luminosityIncreasingWithLight"] = false;
  console.log("aquariumTestConfig is done");
  return vars;
};

exports.getAquarium1TestConfig = function () {
  let vars = {};
  vars["deviceName"] = "Aquarium 1";
  vars["deviceToken"] = "WrzZA9Tl9kv16mwF7X68fpZvt5aSS9j1";
  vars["luminosityThreshold"] = 60;
  vars["luminosityIncreasingWithLight"] = true;
  console.log("aquarium1Config is done");
  return vars;
};

exports.getDoubleSwitcher1Config = function () {
  let vars = {};
  vars["deviceName"] = "Double switcher 1";
  vars["deviceToken"] = "3EZXvbtnf_twDSjoZd6ImiypGZeJ4gB0";
  return vars;
};

exports.getDoubleSwitcherTemplateConfig = function () {
  let vars = {};
  vars["timeOffset"] = "v0";
  vars["switcher1"] = "v1";
  vars["switcher2"] = "v2";
  vars["dateAndTime1"] = "v3";
  vars["dateAndTime2"] = "v4";
  return vars;
};

// ------------ Meteo Boxer ------------

exports.getMeteoBoxerTemplateConfig = function () {
  let vars = {};
  vars["dsAlarmMove"] = "v0";
  vars["dsAlarmLight"] = "v1";
  vars["dsGeneralData"] = "v2";
  vars["dsActivateDetection"] = "v3";
  vars["dsMeteoData"] = "v6";
    return vars;
};

exports.getBoolyaConfig = function () {
  let vars = {};
  vars["deviceName"] = "Boolya Boxer 1";
  vars["deviceToken"] = "zmeIt7afMNDjyKO1VBSo9G0iF6fBbATE";
  console.log("BoolyaBoxer1Config is done");
  return vars;
};