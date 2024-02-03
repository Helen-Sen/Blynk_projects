const { Builder } = require("selenium-webdriver");
driver = new Builder().forBrowser("chrome").build();

waitUiPause = 2000;
waitFeedPause = 8000;
dataProcessingPause = 7000;
