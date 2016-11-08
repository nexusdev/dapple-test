'use strict';
var File = require('vinyl');
var through = require('through2');
var deasync = require('deasync');
var async = require('async');

// This stream takes Solidity contract files and hands them off to the Solidity
// compiler and passes it on.
module.exports = function (opts) {
  return through.obj(function (file, enc, cb) {
    if (false && /classes.json$/.test(file.path)) {
      let classes = JSON.parse(String(file.contents));

      var web3 = opts.web3;
      var libraryAddressMap = {};
      const DEFAULT_GAS = 500000000; // 500 million = 10 ether
      var className;

      async.mapValues(classes, (classObj, className, cb) => {
          web3.eth.sendTransaction({
            from: web3.eth.defaultAccount,
            data: '0x' + classObj.bytecode,
            gas: DEFAULT_GAS,
            gasLimit: DEFAULT_GAS
          }, (err, hash) => {
            web3.eth.getTransactionReceipt(hash, (err, txR) => {
              cb(null, txR.contractAddress.slice(2));
            });
          });
      }, (err, libraryAddressMap) => {
        for (className in classes) {
          classes[className].bytecode = classes[className].bytecode
            .replace(/__([^_]+)_*/g, (matched, name) => {
              // throw an error if the current library is not found
              if (!(name in classes)) throw new Error(`Library ${name} not found!`);
              // throw an error if the current library instance is not found on the chain
              if (!(name in libraryAddressMap)) throw new Error(`Library instance of ${name} not found in your environment!`);
              return libraryAddressMap[name];
          });
        }
        this.push(new File({
          path: 'classes.json',
          contents: new Buffer(JSON.stringify(classes))
        }));
        cb();
      });
    } else {
      this.push(file);
      cb();
    }
  });
};
