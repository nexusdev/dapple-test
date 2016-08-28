/* global it, describe */
'use strict';

var assert = require('chai').assert;
var path = require('path');
var test = require('../lib/test.js');
var through = require('through2');
var vinyl = require('vinyl-fs');
var Web3Factory = require('dapple-core/web3Factory');

describe.skip('streams.test', function () {
  var classesPath = path.join(__dirname,'fixtures', 'streams_test', 'build', 'classes.json');

  it('[SLOW] emits one file for every failing test', function (done) {
    this.timeout(7000);

    Web3Factory.EVM({
      packageRoot: path.join(__dirname, 'fixtures', 'streams_test')
    }, (err, web3) => {
      if (err) return done(err);
      var output = [];

      vinyl.src([classesPath])
      .pipe(test({
        web3: web3
      }))
      .pipe(through.obj(function (file, enc, cb) {
        output.push(file.path);
        cb();
      }, function (cb) {
        cb();
        assert.deepEqual(output.sort(), [
          'Fails/test1 fails.stderr',
          'Fails/test2 fails.stderr',
          'FailsToo/test3 fails.stderr'
        ]);
        done();
      }));
    });
  });
});
