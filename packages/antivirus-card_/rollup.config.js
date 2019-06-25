import { dev, prod } from '../../rollup.config';

// `npm run build` -> `production` is true
// `npm run dev` -> `production` is false
const production = !process.env.ROLLUP_WATCH;

export default (production ? prod('./src/index.ts', './lib/antivirus-card.js') : dev('./public/index.ts', './public/index.js'));
