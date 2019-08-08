import { Component, h, Host } from '@stencil/core';

@Component({
  tag: 'antivirus-card-vmenu',
  styleUrl: 'styles/$.scss',
  shadow: true,
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
