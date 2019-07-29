const fs = require('fs-extra');
const glob = require('glob');

const PATHS = {
  packages: './packages',
  i18n: './i18n',
};

// find build files
const buildFiles = glob.sync('**/dist/esm/**/**.*', { 
  ignore: ['**/node_modules/**', './node_modules/**'],
  root: PATHS.packages
});

// copy build files
buildFiles.forEach(
  async file=> {
    const pathArray = file.split('/');
    await fs.outputFile(`../build/${pathArray[1]}.js`, `export * from './${pathArray[1]}/index.mjs';`)
    await fs.copy(file, `../build/${pathArray[1]}/${pathArray.slice(4).join('/')}`)
  }
);

// copy lang files
fs.copy(PATHS.i18n, '../build/i18n');
