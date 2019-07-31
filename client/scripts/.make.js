const fs = require('fs-extra');
const glob = require('glob');

const PATHS = {
  packages: './packages',
  i18n: './i18n',
};

// find build files
const buildFiles = glob.sync('**/dist/esm/**/**.*', {
  ignore: ['**/node_modules/**', './node_modules/**'],
  root: PATHS.packages,
});

// copy build files
buildFiles.forEach(async file => {
  const pathArray = file.split('/');
  const packageName = pathArray[1];
  await fs.copy(file, `../build/${packageName}/${pathArray.slice(4).join('/')}`);
  await fs.outputFile(`../build/${packageName}.js`, `export * from './${packageName}/index.mjs';`);
});

// copy lang files
fs.copy(PATHS.i18n, '../build/i18n');
