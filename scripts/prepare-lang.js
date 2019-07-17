'use strict';

const fs = require('fs-extra');
const path = require('path');
const glob = require('glob');
const _ = require('lodash');

const PATHS = {
  packages: './packages',
  i18n: './i18n'
};

// minify files
const jsFiles = glob.sync(path.join(PATHS.packages, '**/i18n/*.js'), { ignore: ['**/node_modules/**', './node_modules/**'] });

jsFiles.forEach(filePath => {
  const langFilePath = path.resolve(PATHS.i18n, filePath.split('/').pop() + 'on');

  let fileCommonLang = {};
  let filePackageLang = require(`../${filePath}`);

  if (fs.pathExistsSync(langFilePath)) {
    fileCommonLang = require(langFilePath);
  }

  fs.writeJSONSync(langFilePath, _.merge(fileCommonLang, filePackageLang));
});
