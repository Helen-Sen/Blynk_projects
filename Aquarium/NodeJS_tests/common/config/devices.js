exports.getAquariumTemplateConfig = function() {
  let vars = {};
  vars["dsLightOnHours"] = "v10";
  vars["dsLightOffHours"] = "v11";
  vars["dsFeedHours"] = "v5";
  vars["dsFeedMinutes"] = "v6";
}

exports.getAquariumTestConfig = function() {
  let vars = {};
  vars["deviceName"] = "Aquarium test";
  vars["deviceToken"] = "ZFbdiBHXrv_mtYCIn1pBfwKJllf2K706";
  vars["luminosityThreshold"] = 40;
  vars["luminosityIncreasingWithLight"] = false;
  console.log("aquariumTestConfig is done");
  return vars;
}
