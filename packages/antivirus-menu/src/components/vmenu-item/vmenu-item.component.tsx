import { Component, h } from '@stencil/core';

/**
 * Компонент пункта меню
 */
@Component({
  tag: 'ngispui-vmenu-item',
  styleUrls: ['./scss/ngispui-vmenu-item.scss']
})
export class VMenuItemComponent {
  render() {
    return (
      <div class="ngispui-vmenu-item__wrap">
        <div class="ngispui-vmenu-item__icon">
          <slot name="ngispui-vmenu-icon" />
        </div>
        <div class="ngispui-vmenu-item__label">
          <slot name="ngispui-vmenu-label" />
        </div>
        <slot />
      </div>
    );
  }
}
