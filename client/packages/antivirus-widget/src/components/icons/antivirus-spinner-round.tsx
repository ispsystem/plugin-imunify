import { h, FunctionalComponent } from '@stencil/core';

export interface SpinnerRoundProps {
  color?: string;
}

export const AntivirusSpinnerRound: FunctionalComponent<SpinnerRoundProps> = props => {
  const color = (props && props.color) || '#30ba9a';
  return (
    <svg class="circular" viewBox="25 25 50 50">
      <defs>
        <linearGradient x1="100%" y1="10%" x2="35%" y2="100%" id={'widget-spinner'}>
          <stop stopColor={color} offset="0%" />
          <stop stopColor={color} stopOpacity="0.001" offset="100%" />
        </linearGradient>
      </defs>
      <circle
        class="path"
        cx="50"
        cy="50"
        r="20"
        fill="none"
        // eslint-disable-next-line react/no-unknown-property
        stroke-width="3"
        stroke={'url(#' + 'widget-spinner' + ')'}
        strokeMiterlimit="10"
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
};
