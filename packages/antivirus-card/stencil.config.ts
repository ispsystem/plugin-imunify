import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';

export const config: Config = {
  namespace: 'antivirus-card',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
      copy: [
        {
          src: 'assets',
          dest: '../esm/assets',
          warn: true
        }
      ]
    },
    {
      type: 'docs-readme'
    },
    {
      type: 'www'
    }
  ],
  plugins: [
    sass({
      injectGlobalPaths: ['src/theme.scss']
    })
  ]
};
