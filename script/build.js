/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path');
const { spawnSync } = require('child_process');

const baseDir = path.join(__dirname, '../');
const tscPath = path.join(baseDir, 'node_modules', '.bin', 'tsc');
const esmTsConfigPath = path.join(__dirname, 'tsconfig.esm.json');
const cjsTsConfigPath = path.join(baseDir, 'tsconfig.json');

(async () => {
  // clean
  console.log('clean dist');
  // spawnSync(tscPath, [ '-b', tsConfigPath, '--clean' ]);
  // execute tsc with tsconfig.json
  console.log('start build esm');
  spawnSync(tscPath, [ '-b', esmTsConfigPath ], {
    stdio: 'inherit',
  });
  console.log('start build cjs');
  spawnSync(tscPath, [ '-b', cjsTsConfigPath ], {
    stdio: 'inherit',
  });
  console.log('build success');
})();
