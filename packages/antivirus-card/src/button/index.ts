import { AbstractElement, Define, attr } from 'abstract-element';
import litRender from 'abstract-element/render/lit';
import { html, TemplateResult } from 'lit-html';
import styles from './styles/$.pcss';
import { ButtonType, ThemePalette } from './button.interface';

/**
 * The imunifyav-card web component
 */
@Define('plugin-imunifyav-card-button')
export default class PluginImunifyAvCardButton extends AbstractElement<TemplateResult> {
  @attr('btn-type')
  public btnType: ButtonType = ButtonType.button;
  @attr('is-disabled')
  public isDisabled: boolean = false;
  @attr('btn-theme')
  public theme: ThemePalette = ThemePalette.primary;
  @attr('custom-css-class')
  public customCSSClass = '';

  constructor() {
    super(litRender, true);
  }

  render() {
    return html`
      <style>
        ${styles}
      </style>
      <button
        class="${this.customCSSClass} ngispui-button ngispui-button_type_${ThemePalette[this.theme]}"
        type="${this.btnType}"
        ?disabled="${this.isDisabled}"
      >
        <slot></slot>
      </button>
    `;
  }
}
