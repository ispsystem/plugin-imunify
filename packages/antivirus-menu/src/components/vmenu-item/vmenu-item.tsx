import { Component, h } from '@stencil/core';

/**
 * Компонент пункта меню
 */
@Component({
  tag: 'antivirus-menu-vmenu-item',
  styleUrls: ['./scss/$.scss']
})
export class VMenuItem {
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
