exports.getAquariumTemplateConfig = function () {
  let vars = {};
  vars["dsLightOnHours"] = "v10";
  vars["dsLightOffHours"] = "v11";
  vars["dsFeedHours"] = "v5";
  vars["dsFeedMinutes"] = "v6";
  vars["dsSensorData"] = "v8";
  vars["dsTimeOffSet"] = "v9";
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
