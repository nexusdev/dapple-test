// load the cli spec
var cliSpec = require('../spec/cli.json');
// load controller
var Controller = require('./controller.js');

// Plugin Object
Plugin = {

  // provides a cli controller
  controller: Controller,

  // provides the cli spec
  cliSpec: cliSpec,

  // provides a unique plugin name
  name: "test",

}

module.exports = Plugin;
