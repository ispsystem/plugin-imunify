import { Component, h, Host } from '@stencil/core';

/**
 * Vertical menu item component
 */
@Component({
  tag: 'antivirus-card-vmenu',
  styleUrl: 'styles/$.scss',
})
export class Vmenu {
  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
