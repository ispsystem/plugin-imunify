import { Component, h, Host } from '@stencil/core';

@Component({
  tag: 'antivirus-card-vmenu-item',
  styleUrl: 'styles/$.scss',
  shadow: true,
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
