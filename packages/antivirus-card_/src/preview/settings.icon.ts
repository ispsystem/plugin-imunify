import { AbstractElement, Define } from 'abstract-element';
import litRender from 'abstract-element/render/lit';
import { svg, TemplateResult } from 'lit-html';

/**
 * The imunifyav-card web component
 */
@Define('plugin-imunifyav-card-icon__settings')
export default class IconSettings extends AbstractElement<TemplateResult> {
  constructor() {
    super(litRender);
  }

  render() {
    return svg`
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M9 0.5C13.6944 0.5 17.5 4.30558 17.5 9C17.5 13.6944 13.6944 17.5 9 17.5C4.30558 17.5 0.5 13.6944 0.5 9C0.5 4.30558 4.30558 0.5 9 0.5Z"
          stroke="#344A5E"
        />
        <rect x="5.8501" y="2.25" width="0.9" height="13.5" rx="0.45" fill="#344A5E" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M6.14137 6.4324C6.79924 6.4324 7.33255 5.89909 7.33255 5.24123C7.33255 4.58336 6.79924 4.05005 6.14137 4.05005C5.4835 4.05005 4.9502 4.58336 4.9502 5.24123C4.9502 5.89909 5.4835 6.4324 6.14137 6.4324Z"
          fill="white"
          stroke="#344A5E"
        />
        <rect x="11.25" y="2.25" width="0.900001" height="13.5" rx="0.45" fill="#344A5E" />
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M11.5413 11.8323C12.1991 11.8323 12.7325 11.299 12.7325 10.6411C12.7325 9.98326 12.1991 9.44995 11.5413 9.44995C10.8834 9.44995 10.3501 9.98326 10.3501 10.6411C10.3501 11.299 10.8834 11.8323 11.5413 11.8323Z"
          fill="white"
          stroke="#344A5E"
        />
      </svg>
    `;
  }
}
