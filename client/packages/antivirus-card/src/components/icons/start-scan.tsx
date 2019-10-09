import { h, FunctionalComponent } from '@stencil/core';

/**
 * Properties for start scan component
 */
export interface StartScanIconProps {
  disabled: boolean;
}

/**
 * Start scan functional Components
 * @param props - properties
 */
export const StartScanIcon: FunctionalComponent<StartScanIconProps> = props => {
  const color = props.disabled ? '#9B9B9B' : '#187ABD';
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="start">
        <g id="Group 6">
          <path
            id="Oval 5"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M9.9 17.8C14.2631 17.8 17.8 14.2631 17.8 9.9C17.8 5.53695 14.2631 2 9.9 2C5.53695 2 2 5.53695 2 9.9C2 14.2631 5.53695 17.8 9.9 17.8Z"
            fill="white"
            stroke={color}
          />
          <path
            id="Rectangle 6"
            fillRule="evenodd"
            d="M9.20121 6.06066L12.4243 9.2838C12.6196 9.47906 12.6196 9.79564 12.4243 9.9909L9.20121 13.214C8.88623 13.529 8.34766 13.3059 8.34766 12.8605L8.34766 6.41422C8.34766 5.96876 8.88623 5.74568 9.20121 6.06066Z"
            fill="white"
            stroke={color}
          />
        </g>
      </g>
    </svg>
  );
};
