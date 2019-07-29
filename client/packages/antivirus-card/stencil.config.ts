import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'antivirus-card',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader'
    },
    {
      type: 'docs-readme'
    },
    {
      type: 'www',
      copy: [
        {
          src: '../../../i18n',
          dest: 'plugin/imunify/i18n',
          warn: true
        }
      ]
    }
  ],
  plugins: [
    sass({
      injectGlobalPaths: ['src/theme.scss'],
      includePaths: ['node_modules']
    })
  ],
  devServer: {
    openBrowser: false
  }
};
