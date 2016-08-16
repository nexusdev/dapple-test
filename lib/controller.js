var TestPipeline = require('./testpipeline.js');

module.exports = {
  cli: function (cli, state, BuildPipeline) {
    if(cli.test) {
      console.log('Testing...');

      let nameFilter;
      let report = cli['--report'] || false;

      if (cli['-r']) {
        // if filter String contains upper case letters special regex chars,
        // assume the filtering is case sensitive, otherwise its insensitive
        nameFilter = new RegExp(cli['<RegExp>'],
                                /[A-Z\\\.\[\]\^\$\*\+\{\}\(\)\?\|]/.test(cli['<RegExp>']) ? '' : 'i');
      }

      // var provider = chainModule.web3Provider({
      //   mode: 'temporary'
      // });
      // provider.manager.blockchain.setGasLimit(900000000);
      // var web3 = new Web3(provider);
      // web3.eth.defaultAccount = provider.manager.blockchain.defaultAccount();

      var testPipeline = TestPipeline({
        nameFilter: nameFilter,
        mode: cli['--persistent'] ? 'persistent' : 'temporary',
        state
      });

      let initStream;
      // TODO - reenable this again
      // if (cli['--skip-build']) {
      //   initStream = req.pipelines.BuiltClassesPipeline({
      //     buildRoot: Workspace.findBuildPath(),
      //     packageRoot: Workspace.findPackageRoot(),
      //     subpackages: cli['--subpackages'] || cli['-s']
      //   });
      // } else {
        initStream = BuildPipeline({
          modules: state.modules,
          optimize: cli['--optimize'],
          packageRoot: state.workspace.package_root,
          subpackages: cli['--subpackages'] || cli['-s'],
          report,
          state
        })
        .pipe(req.vinyl.dest(state.workspace.getBuildPath()));
      // }

      initStream.pipe(testPipeline);
    }
  }
}
