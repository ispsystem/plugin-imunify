import { Component, h, Listen, Element } from '@stencil/core';

@Component({
  tag: 'antivirus-card-switcher',
  styleUrl: 'styles/$.scss',
  shadow: true
})
export class Switcher {

  @Element() host: HTMLDivElement;
  
  @Listen('selected')
  selectedOption() {
    let slotted = this.host.shadowRoot.querySelector('slot');
    slotted.assignedNodes().forEach(el=>el['active'] = false);
  }

  render() {
    return (
      <div class="ngispui-switcher">
        <slot />
      </div>
    );
  }
}
