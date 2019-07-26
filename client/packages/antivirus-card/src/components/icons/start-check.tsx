import { h } from '@stencil/core';

export const StartCheckIcon = (props) => (
  <svg width="200" height="30" viewBox="0 0 200 30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <text x="40" y="20" fill="#0279C0">
      {props.btnLabel}
    </text>
    <path
      fill-rule="evenodd"
      clip-rule="evenodd"
      d="M24.3003 22C28.4424 22 31.8003 18.6421 31.8003 14.5C31.8003 10.3579 28.4424 7 24.3003 7C20.1582 7 16.8003 10.3579 16.8003 14.5C16.8003 18.6421 20.1582 22 24.3003 22Z"
      fill="white"
    />
    <path
      d="M31.8319 11.7967C30.7236 8.70937 27.7706 6.5 24.3003 6.5V7.5C27.3353 7.5 29.9205 9.43183 30.8907 12.1345L31.8319 11.7967ZM24.3003 6.5C19.882 6.5 16.3003 10.0817 16.3003 14.5H17.3003C17.3003 10.634 20.4343 7.5 24.3003 7.5V6.5ZM17.0203 17.8213C18.2812 20.5808 21.0661 22.5 24.3003 22.5V21.5C21.4718 21.5 19.0341 19.8224 17.9299 17.4057L17.0203 17.8213ZM24.3003 22.5C28.7186 22.5 32.3003 18.9183 32.3003 14.5H31.3003C31.3003 18.366 28.1663 21.5 24.3003 21.5V22.5Z"
      fill="#187ABD"
    />
    <path d="M29.6102 16.2782L31.9416 14.3902L33.3625 17.1" stroke="#0279C0" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M18.9267 12.685L16.6286 14.6133L15.1607 11.9288" stroke="#0279C0" stroke-linecap="round" stroke-linejoin="round" />
    <rect x="0.5" y="0.5" width="199" height="29" rx="2.5" stroke="#187ABD" />
  </svg>
);
