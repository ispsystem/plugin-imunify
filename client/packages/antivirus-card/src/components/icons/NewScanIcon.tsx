import { h, FunctionalComponent } from '@stencil/core';

/** Properties for newScan icon */
interface NewScanIconProps {
  disabled: boolean;
}

/**
 * New scan icon
 */
export const NewScanIcon: FunctionalComponent<NewScanIconProps> = props => {
  const colors = props.disabled ? ['#9B9B9B', 'white', '#9B9B9B'] : ['#187ABD', '#E8F6FF', '#0279C0'];
  return (
    <svg width="46" height="38" viewBox="0 0 46 38" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.91211 3C5.91211 1.61929 7.0314 0.5 8.41211 0.5H43.0003C44.3811 0.5 45.5003 1.61929 45.5003 3V29.4706C45.5003 30.8513 44.3811 31.9706 43.0003 31.9706H8.41211C7.0314 31.9706 5.91211 30.8513 5.91211 29.4706V3Z"
        fill="white"
        stroke={colors[0]}
      />
      <rect x="11.6621" y="8.02563" width="30.7096" height="4.07353" rx="0.5" fill="white" stroke={colors[0]} />
      <path d="M28.4121 18.2645H41.9415" stroke={colors[0]} strokeLinecap="round" />
      <path d="M18.7725 4.35497H33.993" stroke={colors[0]} strokeLinecap="round" />
      <path d="M28.4121 21.6474H41.9415" stroke={colors[0]} strokeLinecap="round" />
      <path d="M28.4121 25.0292H41.9415" stroke={colors[0]} strokeLinecap="round" />
      <path
        d="M8.11064 21.7738C8.11064 26.0509 11.578 29.5183 15.8551 29.5183C20.1323 29.5183 23.5996 26.0509 23.5996 21.7738C23.5996 17.4966 20.1323 14.0293 15.8551 14.0293C11.578 14.0293 8.11064 17.4966 8.11064 21.7738Z"
        fill={colors[1]}
        stroke={colors[2]}
      />
      <path d="M15.8556 17.3345C18.3074 17.3345 20.2949 19.322 20.2949 21.7738" stroke={colors[2]} strokeLinecap="round" />
      <rect
        y="0.707107"
        width="2.80515"
        height="2.80515"
        rx="1.40257"
        transform="matrix(-0.707107 0.707107 0.707107 0.707107 9.49316 25.1519)"
        fill={colors[1]}
        stroke={colors[2]}
      />
      <rect
        y="0.707107"
        width="7.87868"
        height="2.80515"
        rx="1.40257"
        transform="matrix(-0.707107 0.707107 0.707107 0.707107 6.95703 27.6886)"
        fill={colors[1]}
        stroke={colors[2]}
      />
    </svg>
  );
};
