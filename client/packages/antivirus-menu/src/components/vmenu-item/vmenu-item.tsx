import { Component, h, Prop } from '@stencil/core';

/**
 * Компонент пункта меню
 */
@Component({
  tag: 'antivirus-menu-vmenu-item',
  styleUrls: ['./scss/$.scss'],
  shadow: true
})
export class VMenuItem {
  @Prop({ reflect: true }) active: boolean;
  @Prop({ reflect: true }) disabled: boolean;
  @Prop({ reflect: true, attribute: 'icon-only' }) iconOnly: boolean;

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
