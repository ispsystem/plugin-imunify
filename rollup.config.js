import typescript from 'rollup-plugin-typescript';
import resolve from 'rollup-plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import postcss from 'rollup-plugin-postcss';
import minifyLiteralsHTML from 'rollup-plugin-minify-html-literals';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

const pluginsCommon = [
  typescript(),
  resolve(), // tells Rollup how to find date-fns in node_modules
  postcss({
    inject: false
  })
];

export const dev = (input, file) => ({
  input,
  output: {
    file,
    format: 'iife', // immediately-invoked function expression — suitable for <script> tags
    sourcemap: true
  },
  plugins: pluginsCommon
});

export const prod = (input, file) => ({
  input,
  output: {
    file,
    format: 'es'
  },
  plugins: [...pluginsCommon, terser(), minifyLiteralsHTML()]
});

export default input => {
  return production ? prod(input) : dev(input);
};
