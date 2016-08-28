/* global it, describe */
'use strict';

var assert = require('chai').assert;
var Contract = require('../lib/contract.js');
var fs = require('fs');
var Web3Factory = require('dapple-core/web3Factory.js');
var VMTest = require('../lib/vmtest.js');

// TODO - either find a way to create fast in memory forks with memdown
//        or create a temporary db in a directory
describe.skip('VMTest', function () {
  // var source;
  //
  // before(function (done) {
  //   var src = vinyl.src(['./test/_fixtures/mocktest.sol']);
  //   src.pipe(through.obj(function (file, enc) {
  //   source = file;
  //   done();
  //   }));
  // });

  var mock = JSON.parse(
  String(fs.readFileSync('./test/_fixtures/mocktest.json')));

  it('parses Contract objects for test functions', function (done) {
    var contract = new Contract(mock.contracts.Pass);
    Web3Factory.EVM({
       type: 'tmp',
       chainenv:
         { branch: true,
           meta:
             { heads: {},
               rawHead: '4e078aa76481abc0a1c5504ddabac9c3e3324104d4d141d7d58af3f14dc5b05e',
               height: 0,
               genesis: '4e078aa76481abc0a1c5504ddabac9c3e3324104d4d141d7d58af3f14dc5b05e' },
               stateRoot: '0xeb1dab34a6173ee8f28b4b07027cf7acc2a40ad67b0f4be12ceca858c2fba88f',
               env: {},
               fakedOwnership: [ '0x0000000000000000000000000000000000000000' ],
               defaultAccount: '0x0000000000000000000000000000000000000000',
               devmode: true,
               type: 'internal' }
    }, (err, web3) => {
      if (err) return done(err);
      var vmtest = new VMTest(web3, contract);
      assert.equal(1, vmtest.testCount(), 'expected 1 test function');
      vmtest.stop(done);
    });
  });

  it('endows tests with ether upon deployment', function (done) {
    var contract = new Contract(mock.contracts.Pass);
    Web3Factory.EVM({
      chainenv: { network: 'internal' }
    }, (err, web3) => {
      if (err) return done(err);
      var vmtest = new VMTest(web3, contract);
      vmtest.deploy(function (err, receipt) {
        assert.isNull(err, 'error: ' + err);
        vmtest.web3.eth.getBalance(receipt.contractAddress, function (err, bal) {
          assert.isNull(err, 'error: ' + err);
          assert.isAbove(bal.toNumber(), 0, 'test contract has no ether');
          vmtest.stop(done);
        });
      });
    });
  });

  it('runs tests by their indices', function (done) {
    var contract = new Contract(mock.contracts.Pass);
    Web3Factory.EVM((err, web3) => {
      if (err) return done(err);
      var vmtest = new VMTest(web3, contract);
      vmtest.runTest(0, function (err, result) {
        assert.notOk(err);
        assert.notOk(result.failed, 'test failed, should have passed');
        assert.equal(0, result.logs.length);
        vmtest.stop(done);
      });
    });
  });

  it('returns log results', function (done) {
    var contract = new Contract(mock.contracts.Fail);
    Web3Factory.EVM((err, web3) => {
      if (err) return done(err);
      var vmtest = new VMTest(web3, contract);
      vmtest.runTest(0, function (err, result) {
        assert.notOk(err);
        // TODO - was on -- but it should be false, or do i misunderstand something?
        assert.notOk(result.failed, 'test passed, should have failed');
        assert.equal(1, result.logs.length);
        vmtest.stop(done);
      });
    });
  });

  it('passes if an expected exception is thrown', function (done) {
    var contract = new Contract(mock.contracts.Throw);
    Web3Factory.EVM((err, web3) => {
      if (err) return done(err);
      var vmtest = new VMTest(web3, contract);
      vmtest.runTest(0, function (err, result) {
        assert.notOk(err);
        assert.notOk(result.failed, 'test failed, should have passed');
        vmtest.stop(done);
      });
    });
  });

  it('fails if an expected exception is not thrown', function (done) {
    var contract = new Contract(mock.contracts.NotThrow);
    Web3Factory.EVM((err, web3) => {
      if (err) return done(err);
      var vmtest = new VMTest(web3, contract);
      vmtest.runTest(0, function (err, result) {
        assert.notOk(err);
        assert.ok(result.failed, 'test passed, should have failed');
        vmtest.stop(done);
      });
    });
  });

  it('catches exactly expected event', function (done) {
    var contract = new Contract(mock.contracts.Event);
    Web3Factory.EVM((err, web3) => {
      if (err) return done(err);
      var vmtest = new VMTest(web3, contract);
      vmtest.runTest(0, function (err, result) {
        assert.notOk(err);
        assert.notOk(result.failed, 'test failed, should have passed');
        assert.equal(2, result.logs.length);
        vmtest.stop(done);
      });
    });
  });

  it('catches exactly expected events', function (done) {
    var contract = new Contract(mock.contracts.Event2);
    Web3Factory.EVM((err, web3) => {
      if (err) return done(err);
      var vmtest = new VMTest(web3, contract);
      vmtest.runTest(0, function (err, result) {
        assert.notOk(err);
        assert.notOk(result.failed, 'test failed, should have passed');
        assert.equal(4, result.logs.length);
        vmtest.stop(done);
      });
    });
  });

  it('fails if expected event do not match exactly', function (done) {
    var contract = new Contract(mock.contracts.EventFail);
    Web3Factory.EVM((err, web3) => {
      if (err) return done(err);
      var vmtest = new VMTest(web3, contract);
      vmtest.runTest(0, function (err, result) {
        assert.notOk(err);
        assert.ok(result.failed, 'test failed, should have passed');
        assert.equal(2, result.logs.length);
        vmtest.stop(done);
      });
    });
  });

  it('fails if expected events do not match exactly', function (done) {
    var contract = new Contract(mock.contracts.EventFail2);
    Web3Factory.EVM((err, web3) => {
      if (err) return done(err);
      var vmtest = new VMTest(web3, contract);
      vmtest.runTest(0, function (err, result) {
        assert.notOk(err);
        assert.ok(result.failed, 'test failed, should have passed');
        assert.equal(4, result.logs.length);
        vmtest.stop(done);
      });
    });
  });
});
