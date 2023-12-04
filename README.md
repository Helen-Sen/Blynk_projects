# Blynk_projects

1. General info

It is a Mini-framework for automated testing of devices that are controlled by the Blynk platform (blynk.cloud).
Prerequisites: Selenium IDE and/or NodeJS + Mocha should be installed.

1.1 Tests are created:
1.1.1 Using the Selenium IDE - plugin for Google Chrom (folder: /Aquarium/Selenium_tests)
1.1.2 Using Node JS platform with the Mocha test framework (folder: /Aquarium/NodeJS_tests)

1.2 Devices:
Autotests currently control two types of devices:
1.2.1 "Aquarium" - controller for monitoring parameters and controlling the aquarium features and parameters (lights on/off, automatic feeder, temperature, luminosity, water pump).
1.2.2 "Double switcher" - a smart socket allowing power outage testing for the aquarium controller.

1.3 The "Aquarium" type is now represented by two devices: "Aquarium 1" and "Aquarium test".
1.3.1 "Aquarium 1"  is a controller for the real aquarium, try not to use it for testing.
1.3.2 “Aquarium Test” - a controller connected to power via a smart socket (“Double Switcher 1”) to make a power outage when needed. It is preferable to run all tests on it.

1.4 The Double Switcher type is now represented by one device: "Double Switcher 1".


2. How to use

2.1 Selenium_tests 
2.1.1 Tests are located in the folder: /Aquarium/Selenium_tests.
Aquarium.side - a set of test suits for manual and scheduled feeding, and for light control.
Use Selenium IDE to open Aquarium.side file. The tests were written to study the basic functions of Selenium IDE and will not be developed or supported in the future.

2.2  NodeJS_tests 
2.2.1. The main tests are located in the folder:  /Aquarium/NodeJS_tests/test/aquarium

To run tests, the files containing links to device configurations should be run. These starting files run the actual tests.
The starting files are located in:
  - for "Aquarium test": /Aquarium/NodeJS_tests/test/aquarium/test_env
  - for "Aquarium 1": /Aquarium/NodeJS_tests/test/aquarium/prod_env
 
Before running the test, move to the Blynk_projects/Aquarium/NodeJS_tests using a console(terminal). 
Command example: mocha ./test/aquarium/test_env/AquariumTest-test_manual_feed.js

2.2.2. Service modules for running tests are located in separate folders: 
- device configurations: Aquarium/NodeJS_tests/common/config/devices.js
- aquarium functions: Aquarium/NodeJS_tests/common/action/aquarium_actions.js
- general-purpose functions: Aquarium/NodeJS_tests/common/action/common_actions.js  
2.3 Global NodeJS objects are located in the file Aquarium/NodeJS_tests/common/main_objects.js

Notes: Blynk login and password can be placed into the blynk.properties file. We can provide our credentials to the team members only.


