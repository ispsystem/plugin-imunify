import { Component, h, Host, Prop, Event, EventEmitter, Listen } from '@stencil/core';

@Component({
  tag: 'antivirus-card-switcher-option',
  shadow: true
})
export class SwitcherOption {
  @Prop({ reflect: true, mutable: true }) active = false;
  @Prop({ reflect: true }) disabled = false;
  @Prop({ reflect: true }) last = false;
  @Prop({ attribute: 'selected-disabled', reflect: true }) selectedDisabled = false;

  @Event() selected: EventEmitter;

  /**
   * The method of selecting an item initiated by the user
   */
  @Listen('click', { capture: true })
  selectViaInteraction(): void {
    if (!this.disabled) {
      this.selected.emit(true);
      this.active = true;
    }
  }

  render() {
    return (
      <Host>
        <slot />
      </Host>
    );
  }
}
