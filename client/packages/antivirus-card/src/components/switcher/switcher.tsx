import { Component, h, Listen, Element } from '@stencil/core';

@Component({
  tag: 'antivirus-card-switcher',
  styleUrl: 'styles/$.scss',
  shadow: true,
})
export class Switcher {
  @Element() host: HTMLDivElement;

  @Listen('selected')
  selectedOption() {
    const slotted = this.host.shadowRoot.querySelector('slot');
    slotted.assignedNodes().forEach(el => (el['active'] = false));
  }

  render() {
    return (
      <div class="ispui-switcher">
        <slot />
      </div>
    );
  }
}
