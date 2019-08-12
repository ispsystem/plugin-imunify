import { Component, h, Host } from '@stencil/core';

/**
 * Vertical menu item component
 */
@Component({
  tag: 'antivirus-card-vmenu-item',
  styleUrl: 'styles/$.scss',
})
export class VmenuItem {
  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
