import { h, FunctionalComponent } from '@stencil/core';

/**
 * Props interface for spinner
 */
export interface SpinnerRoundProps {
  color?: string;
}

/**
 * Functional component spinner
 */
export const AntivirusSpinnerRound: FunctionalComponent<SpinnerRoundProps> = props => {
  const color = (props && props.color) || '#30ba9a';
  /* eslint-disable react/no-unknown-property */
  return (
    <svg class="circular" viewBox="25 25 50 50">
      <defs>
        <linearGradient x1="100%" y1="10%" x2="35%" y2="100%" id={'widget-spinner'}>
          <stop stop-color={color} offset="0%" />
          <stop stop-color={color} stop-opacity="0.001" offset="100%" />
        </linearGradient>
      </defs>
      <circle
        class="path"
        cx="50"
        cy="50"
        r="20"
        fill="none"
        stroke-width="3"
        stroke={'url(#' + 'widget-spinner' + ')'}
        stroke-miterlimit="10"
      />
      {/* <g>
      <svg>
        <text x="50" y="60" text-anchor="middle" font-size="30px" stroke="blue" stroke-width="1px">
          X
        </text>
      </svg>
    </g> */}
    </svg>
  );
  /* eslint-enable react/no-unknown-property */
};
