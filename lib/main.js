// load the cli spec
var cliSpec = require('../spec/cli.json');
// load controller
var Controller = require('./controller.js');
var through = require('through2');
var File = require('vinyl');
var fs = require('dapple-core/file.js');
var preprocess = require('./preprocess.js');

// Plugin Object
Plugin = {

  // provides a cli controller
  controller: Controller,

  // provides the cli spec
  cliSpec: cliSpec,

  // provides a unique plugin name
  name: "test",

  inject: function (opts) {

    return through.obj( (file, enc, cb) => {cb(null, file);}, function (cb) {
      this.push(new File({
        path: 'dapple/debug.sol',
        contents: new Buffer(fs.readFileStringSync(__dirname + '/../spec/debug.sol'))
      }));
      this.push(new File({
        path: 'dapple/reporter.sol',
        contents: new Buffer(fs.readFileStringSync(__dirname + '/../spec/reporter.sol'))
      }));
      this.push(new File({
        path: 'dapple/test.sol',
        contents: new Buffer(fs.readFileStringSync(__dirname + '/../spec/test.sol'))
      }));
      cb();
    });
  },

  preprocess

}

module.exports = Plugin;
