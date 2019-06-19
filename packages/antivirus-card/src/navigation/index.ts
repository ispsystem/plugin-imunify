import { AbstractElement, Define, attr } from 'abstract-element';
import litRender from 'abstract-element/render/lit';
import { html, TemplateResult } from 'lit-html';
import styles from './styles/$.pcss';

/**
 * The imunifyav-card web component
 */
@Define('plugin-imunifyav-card-navigation')
export default class PluginImunifyAvCardNavigation extends AbstractElement<TemplateResult> {
  constructor() {
    super(litRender, true);
  }

  render() {
    return html`
      <style>
        ${styles}
      </style>
      <div style="--ngispui-navigation-border-line-top: -13px; margin-bottom: 20px;" class="ngispui-navigation">
        <div class="ngispui-navigation-item">Таб №1</div>
        <div class="ngispui-navigation-item ngispui-navigation-item_active">
          Таб №2
        </div>
        <div class="ngispui-navigation-item ngispui-navigation-item_disabled">Таб disabled</div>
        <div class="ngispui-navigation-item ngispui-navigation-item_active">Таб №4</div>
        <div class="ngispui-navigation-item ngispui-navigation-item_indicator">Таб №5</div>
      </div>
    `;
  }
}
