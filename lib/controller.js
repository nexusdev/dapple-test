var TestPipeline = require('./testpipeline.js');
var vinyl = require('vinyl-fs');

module.exports = {
  cli: function (state, cli, BuildPipeline) {
    if(cli.test) {
      console.log('Testing...');

      let report = cli['--report'] || false;
      var contractFilter = /.*/;
      var functionFilter = /.*/;
      if (cli['-r']) {
        let filter = cli['<filter>'].split('.');
        contractFilter = new RegExp('^'+filter[0].split('*').join('.*')+"$", 'i');
        if(filter.length > 1) {
          functionFilter = new RegExp('^'+filter[1].split('*').join('.*')+"$", 'i');
        } else {
          functionFilter = /.*/;
        }
      }

      TestPipeline({
        contractFilter,
        functionFilter,
        mode: cli['--persistent'] ? 'persistent' : 'temporary',
        state
      }, (err, testPipeline) => {

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
        .pipe(vinyl.dest(state.workspace.getBuildPath()));
        // }

        initStream.pipe(testPipeline);
      });

    }
  }
}
