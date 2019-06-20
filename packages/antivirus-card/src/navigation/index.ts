import { AbstractElement, Define, state } from 'abstract-element';
import litRender from 'abstract-element/render/lit';
import { html, TemplateResult } from 'lit-html';
import styles from './styles/$.pcss';

/**
 * The imunifyav-card web component
 */
@Define('plugin-imunifyav-card-navigation')
export default class PluginImunifyAvCardNavigation extends AbstractElement<TemplateResult> {
  @state()
  items: {
    label: string;
    active: boolean;
  }[] = [];

  constructor() {
    super(litRender, true);
  }

  render() {
    return html`
      <style>
        ${styles}
      </style>
      <div style="--ngispui-navigation-border-line-top: -13px; margin-bottom: 20px;" class="ngispui-navigation">
        ${this.items.map(
          (val, index) =>
            html`
              <div
                @click=${this.handleClickItem.bind(this, index)}
                class=${'ngispui-navigation-item ' + (val.active ? 'ngispui-navigation-item_active' : '')}
              >
                ${val.label}
              </div>
            `
        )}
      </div>
    `;
  }

  handleClickItem(index: number, e: MouseEvent) {
    console.log(index, e);

    this.items.map(item => {
      if (item.active) {
        item.active = false;
      }
    });

    this.items[index].active = true;

    let clickItemEvent = new CustomEvent('click-item', {
      detail: { index },
      bubbles: true,
      composed: true
    });
    
    this.dispatchEvent(clickItemEvent);
  }
}
