import { Component, h, Host } from '@stencil/core';

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
