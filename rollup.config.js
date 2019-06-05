// rollup.config.js
import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

// const common = {
//   plugins: [
//     typescript(),
//     resolve(), // tells Rollup how to find date-fns in node_modules
//     production && terser(), // minify, but only in production
//     postcss({
//       inject: false
//     })
//   ]
// }

const pluginsCommon = [
  typescript(),
  resolve(), // tells Rollup how to find date-fns in node_modules
  postcss({
    inject: false
  })
];

const dev = {
  input: './src/index.ts',
  output: {
    file: 'public/bundle.js',
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    sourcemap: true
  },
  plugins: pluginsCommon
};

const prod = {
  input: './src/plugin/index.ts',
  output: {
    file: 'dist/plugin.js',
    format: 'es'
  },
  plugins: [
    ...pluginsCommon,
    terser() // minify, but only in production
  ]
};

export default (production ? prod : dev);
