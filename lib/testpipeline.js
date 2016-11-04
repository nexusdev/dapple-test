"use strict";

var test = require('./test.js');
var cli_out = require('./cli_out.js');
var linkLibraries = require('./linklibraries.js');
var test_summarizer = require('./test_summarizer.js');
var _ = require('lodash');
var Combine = require('stream-combiner');

var Web3Interface = require('dapple-core/web3Interface.js');

// TODO - refactor this out
var _fillOptionDefaults = function (opts) {
  if (!opts) opts = {};

  var defaults = {
    deployData: true,
    globalVar: false,
    preprocessorVars: {},
    web3: 'internal',
    confirmationBlocks: 1
  };

  var _opts = _.assign(defaults, opts);
  return _opts;
};

var TestPipeline = function (opts, callback) {
  // Defaults
  opts = _fillOptionDefaults(opts);

  var chainenv = opts.state.state.pointers[opts.state.state.head];
  if(/^(MORDEN|ETH|ETC)$/.test(chainenv.type)) {
    console.log(`You are on a ${chainenv.type} chain. Forking of might take a while...`);
  }
  new Web3Interface(_.assign({type: 'tmp', chainenv, db: opts.state.db}, opts), null, (err, web3Interface) => {
    web3Interface._web3.currentProvider.manager.blockchain.setBalance(chainenv.defaultAccount, '0x56bc75e2d63100000000', () => {
      web3Interface._web3.currentProvider.manager.blockchain.setGasLimit(900000000);
      opts.web3 = web3Interface._web3;
      var tpl = Combine(
        linkLibraries(opts),
        test(opts),
        cli_out(),
        test_summarizer(),
        cli_out()
      );
      callback(null, tpl);
    });
  });


};

module.exports = TestPipeline;
