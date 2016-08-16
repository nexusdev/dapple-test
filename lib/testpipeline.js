"use strict";

var test = require('./test.js');
var cli_out = require('./cli_out.js');
var test_summarizer = require('./test_summarizer.js');

var Web3Interface = require('dapple-core/web3Interface.js');

var TestPipeline = function (opts) {
  // Defaults
  opts = _fillOptionDefaults(opts);

  var chainenv = opts.state.state.pointers[opts.state.state.head];
  var web3Interface = new Web3Interface(_.assign({type: 'tmp', chainenv, db: opts.state.db}, opts));
  web3Interface._web3.currentProvider.manager.blockchain.setGasLimit(900000000);

  opts.web3 = web3Interface._web3

  return Combine(
    // streams.linkLibraries(opts),
    test(opts),
    cli_out(),
    test_summarizer(),
    cli_out()
  );
};

module.exports = TestPipeline;
