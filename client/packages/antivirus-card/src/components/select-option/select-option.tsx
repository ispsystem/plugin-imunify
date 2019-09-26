import { Component, h, Host, Prop, Event, EventEmitter, Element, Listen } from '@stencil/core';
import { SelectedOption } from '../select/select';

/**
 * Select option component for custom select
 */
@Component({
  tag: 'antivirus-card-select-option',
  styleUrl: 'styles/$.scss',
  shadow: true,
})
export class SelectOption {
  /** Host element */
  @Element()
  private _host: HTMLAntivirusCardSelectOptionElement;

  /** Option value */
  @Prop() value: SelectedOption['v'];

  /** Key for active selected value  */
  @Prop({ reflect: true, mutable: true })
  selected = false;

  /** Event by change selected status */
  @Event() changedSelectStatus: EventEmitter<SelectedOption>;

  /**
   * Method of selecting an item initiated by the user
   */
  @Listen('click', { capture: true })
  selectViaInteraction(): void {
    this.changedSelectStatus.emit({ k: this._host.textContent, v: this.value });
  }

  componentDidLoad() {
    if (this.selected) {
      this.changedSelectStatus.emit({ k: this._host.textContent, v: this.value });
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
