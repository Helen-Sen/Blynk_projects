// ------------ Aquarium ------------

exports.getAquariumTemplateConfig = {
  dsLightOnHours: "v10",
  dsLightOffHours: "v11",
  dsFeedHours: "v5",
  dsFeedMinutes: "v6",
  dsSensorData: "v8",
  dsTimeOffSet: "v9",
  dsPumpState: "v3",
  dsPumpMode: "v1",
};

exports.getAquariumTestConfig = {
  deviceName: "Aquarium test",
  deviceToken: "ZFbdiBHXrv_mtYCIn1pBfwKJllf2K706",
  luminosityThreshold: 40,
  luminosityIncreasingWithLight: false,
};

exports.getAquarium1TestConfig = {
  deviceName: "Aquarium 1",
  deviceToken: "WrzZA9Tl9kv16mwF7X68fpZvt5aSS9j1",
  luminosityThreshold: 60,
  luminosityIncreasingWithLight: true,
};

// -------------------Double Switcher-------------------

exports.getDoubleSwitcherTemplateConfig = {
  timeOffset: "v0",
  switcher1: "v1",
  switcher2: "v2",
  dateAndTime1: "v3",
  dateAndTime2: "v4",
};

exports.getDoubleSwitcher1Config = {
  deviceName: "Double switcher 1",
  deviceToken: "3EZXvbtnf_twDSjoZd6ImiypGZeJ4gB0",
};

exports.getDoubleSwitcher2Config = {
  deviceName: "Double switcher 2",
  deviceToken: "d8EaGFSvYKjL2MjQs3onuRJ7vYgplFbD",
};

// ------------ Meteo Boxer ------------

exports.getMeteoBoxerTemplateConfig = {
  dsAlarmMove: "v0",
  dsAlarmLight: "v1",
  dsGeneralData: "v2",
  dsActivateDetection: "v3",
  dsDateAndTime: "v4",
  dsLuminosityThreshold: "v5",
  dsMeteoData: "v6",
  dsTimeOffSet: "v9",
};

exports.getBoolyaConfig = {
  deviceName: "Boolya Boxer 1",
  deviceToken: "zmeIt7afMNDjyKO1VBSo9G0iF6fBbATE",
  testLightLuminosity: 75,
};
