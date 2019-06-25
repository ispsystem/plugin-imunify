import { AbstractElement, Define } from 'abstract-element';
import litRender from 'abstract-element/render/lit';
import { svg, TemplateResult } from 'lit-html';

/**
 * The imunifyav-card web component
 */
@Define('plugin-imunifyav-card-icon__check-list')
export default class PluginImunifyAvCheckList extends AbstractElement<TemplateResult> {
  constructor() {
    super(litRender);
  }

  render() {
    return svg`
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2.5" y="2.5" width="25" height="27" rx="2.5" fill="white" stroke="#344A5E" />
        <path
          d="M9.58535 1.5C9.79127 0.917404 10.3469 0.5 11 0.5H18C18.6531 0.5 19.2087 0.917404 19.4146 1.5H9.58535Z"
          fill="#344A5E"
          stroke="#344A5E"
        />
        <path d="M20 10L21.5 11.5L24 9" stroke="#344A5E" />
        <path d="M20 15L21.8 16.8L23 18" stroke="#E44592" />
        <path d="M23 15L21.2 16.8L20 18" stroke="#E44592" />
        <path d="M20 22L21.5 23.5L24 21" stroke="#344A5E" />
        <line x1="5.5" y1="5.5" x2="22.5" y2="5.5" stroke="#344A5E" stroke-linecap="round" />
        <line x1="5.5" y1="9.5" x2="13.5" y2="9.5" stroke="#344A5E" stroke-linecap="round" />
        <line x1="5.5" y1="11.5" x2="15.5" y2="11.5" stroke="#344A5E" stroke-linecap="round" />
        <line x1="5.5" y1="15.5" x2="15.5" y2="15.5" stroke="#E44592" stroke-linecap="round" />
        <line x1="5.5" y1="17.5" x2="8.5" y2="17.5" stroke="#E44592" stroke-linecap="round" />
        <line x1="5.5" y1="23.5" x2="15.5" y2="23.5" stroke="#344A5E" stroke-linecap="round" />
      </svg>
    `;
  }
}
