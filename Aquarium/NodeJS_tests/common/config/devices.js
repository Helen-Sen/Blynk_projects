exports.getAquariumTemplateConfig = function() {
  let vars = {};
  vars["dsLightOnHours"] = "v10";
  vars["dsLightOffHours"] = "v11";
  vars["dsFeedHours"] = "v5";
  vars["dsFeedMinutes"] = "v6";
  vars["dsSensorData"] = "v8";
  return vars;
}

exports.getAquariumTestConfig = function() {
  let vars = {};
  vars["deviceName"] = "Aquarium test";
  vars["deviceToken"] = "ZFbdiBHXrv_mtYCIn1pBfwKJllf2K706";
  vars["luminosityThreshold"] = 40;
  vars["luminosityIncreasingWithLight"] = false;
  // console.log("aquariumTestConfig is done");
  return vars;
}

exports.getAquarium1Config = function() {
  let vars = {};
  vars["deviceName"] = "Aquarium 1";
  vars["deviceToken"] = "WrzZA9Tl9kv16mwF7X68fpZvt5aSS9j1";
  vars["luminosityThreshold"] = 60;
  vars["luminosityIncreasingWithLight"] = true;
  // console.log("getAquarium1Config is done");
  return vars;
}
