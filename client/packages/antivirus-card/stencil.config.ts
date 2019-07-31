import { Config } from '@stencil/core';
import { sass } from '@stencil/sass';
import { postcss } from '@stencil/postcss';
import { default as inlineSvg } from 'postcss-inline-svg';

export const config: Config = {
  namespace: 'antivirus-card',
  outputTargets: [
    {
      type: 'dist',
      esmLoaderPath: '../loader',
    },
    {
      type: 'docs-readme',
    },
    {
      type: 'www',
      copy: [
        {
          src: '../../../i18n',
          dest: 'plugin/imunify/i18n',
          warn: true,
        },
      ],
    },
  ],
  plugins: [
    sass({
      injectGlobalPaths: ['src/theme.scss'],
    }),
    postcss({
      plugins: [inlineSvg()],
    }),
  ],
  devServer: {
    openBrowser: false,
  },
};
